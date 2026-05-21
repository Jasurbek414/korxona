import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../core/theme.dart';
import '../../data/providers.dart';
import '../../data/models.dart';
import '../../data/api_client.dart';

class PprDetailScreen extends ConsumerStatefulWidget {
  final int taskId;
  const PprDetailScreen({super.key, required this.taskId});
  @override
  ConsumerState<PprDetailScreen> createState() => _PprDetailScreenState();
}

class _PprDetailScreenState extends ConsumerState<PprDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  @override
  void initState() { super.initState(); _tabController = TabController(length: 4, vsync: this); }
  @override
  void dispose() { _tabController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final taskAsync = ref.watch(pprTaskDetailProvider(widget.taskId));
    return taskAsync.when(
      data: (task) => _buildContent(task),
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, s) => Scaffold(appBar: AppBar(), body: Center(child: Text('Xato: $e'))),
    );
  }

  Widget _buildContent(PprTask task) {
    return Scaffold(
      appBar: AppBar(
        title: Text(task.taskNumber ?? 'PPR #${task.id}'),
        actions: [
          if (task.status != 'COMPLETED' && task.status != 'APPROVED')
            PopupMenuButton<String>(
              onSelected: (status) => _changeStatus(status),
              itemBuilder: (_) => [
                if (task.status == 'SCHEDULED') const PopupMenuItem(value: 'IN_PROGRESS', child: Text('▶️ Boshlash')),
                if (task.status == 'IN_PROGRESS') const PopupMenuItem(value: 'COMPLETED', child: Text('✅ Yakunlash')),
              ],
            ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.primary, unselectedLabelColor: AppTheme.textMuted,
          indicatorColor: AppTheme.primary,
          labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          tabs: const [Tab(text: "Ma'lumot"), Tab(text: 'Chek-list'), Tab(text: 'Izohlar'), Tab(text: 'Foto/Vaqt')],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _InfoTab(task: task),
          _ChecklistTab(taskId: widget.taskId),
          _CommentsTab(taskId: widget.taskId),
          _PhotoTimeTab(taskId: widget.taskId),
        ],
      ),
    );
  }

  Future<void> _changeStatus(String newStatus) async {
    try {
      await ApiClient().dio.patch('/ppr/tasks/${widget.taskId}/status', data: {'status': newStatus});
      ref.invalidate(pprTaskDetailProvider(widget.taskId));
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Status: $newStatus ✅'), backgroundColor: AppTheme.success));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Xato: $e'), backgroundColor: AppTheme.danger));
    }
  }
}

// ===== INFO TAB =====
class _InfoTab extends StatelessWidget {
  final PprTask task;
  const _InfoTab({required this.task});

  Color _statusColor() => switch (task.status) { 'SCHEDULED' => AppTheme.info, 'IN_PROGRESS' => AppTheme.warning, 'COMPLETED' => AppTheme.success, 'APPROVED' => const Color(0xFF059669), _ => AppTheme.textMuted };
  Color _priorityColor() => switch (task.priority) { 'CRITICAL' => AppTheme.danger, 'HIGH' => const Color(0xFFF97316), 'NORMAL' => AppTheme.info, _ => AppTheme.textMuted };

  @override
  Widget build(BuildContext context) {
    return ListView(padding: const EdgeInsets.all(16), children: [
      Row(children: [
        _Badge(text: task.statusLabel, color: _statusColor(), large: true),
        const SizedBox(width: 8),
        _Badge(text: task.priorityLabel, color: _priorityColor(), large: true),
        if (task.isOverdue) ...[const SizedBox(width: 8), _Badge(text: "⚠️ Muddati o'tgan", color: AppTheme.danger, large: true)],
      ]),
      const SizedBox(height: 20),
      _DetailRow(icon: Icons.computer_rounded, label: 'Uskuna', value: task.equipmentName),
      _DetailRow(icon: Icons.build_rounded, label: 'PPR turi', value: task.pprTypeName),
      _DetailRow(icon: Icons.calendar_today_rounded, label: 'Rejalashtirilgan sana', value: task.scheduledDate),
      _DetailRow(icon: Icons.person_rounded, label: "Mas'ul", value: task.assignedToName),
      if (task.description != null) _DetailRow(icon: Icons.description_rounded, label: 'Tavsif', value: task.description),
      if (task.completionNotes != null) _DetailRow(icon: Icons.notes_rounded, label: 'Yakunlash izohi', value: task.completionNotes),
      if (task.timeSpentMinutes != null && task.timeSpentMinutes! > 0)
        _DetailRow(icon: Icons.timer_rounded, label: 'Sarflangan vaqt', value: '${task.timeSpentMinutes! ~/ 60} soat ${task.timeSpentMinutes! % 60} daqiqa'),
    ]);
  }
}

// ===== CHECKLIST TAB =====
class _ChecklistTab extends ConsumerWidget {
  final int taskId;
  const _ChecklistTab({required this.taskId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final checklistAsync = ref.watch(checklistProvider(taskId));
    return checklistAsync.when(
      data: (items) {
        if (items.isEmpty) return const Center(child: Text("Chek-list bo'sh", style: TextStyle(color: AppTheme.textMuted)));
        final done = items.where((i) => i.completed).length;
        final progress = items.isNotEmpty ? done / items.length : 0.0;
        return Column(children: [
          Container(
            margin: const EdgeInsets.all(16), padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.border)),
            child: Column(children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text('$done / ${items.length} bajarildi', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                Text('${(progress * 100).toInt()}%', style: TextStyle(fontWeight: FontWeight.w700, color: progress == 1 ? AppTheme.success : AppTheme.primary)),
              ]),
              const SizedBox(height: 10),
              ClipRRect(borderRadius: BorderRadius.circular(6), child: LinearProgressIndicator(value: progress, minHeight: 8, backgroundColor: AppTheme.bgMain, color: progress == 1 ? AppTheme.success : AppTheme.primary)),
            ]),
          ),
          Expanded(child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16), itemCount: items.length,
            itemBuilder: (_, i) => _ChecklistTile(item: items[i], taskId: taskId, onToggle: () async {
              try { await ApiClient().dio.patch('/ppr/tasks/$taskId/checklist/${items[i].id}/toggle', data: {}); ref.invalidate(checklistProvider(taskId)); } catch (_) {}
            }),
          )),
        ]);
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, s) => Center(child: Text('Xato: $e')),
    );
  }
}

class _ChecklistTile extends StatelessWidget {
  final ChecklistItem item; final int taskId; final VoidCallback onToggle;
  const _ChecklistTile({required this.item, required this.taskId, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: item.completed ? AppTheme.success.withValues(alpha: 0.3) : AppTheme.border)),
      child: ListTile(
        onTap: onToggle,
        leading: Container(
          width: 28, height: 28,
          decoration: BoxDecoration(color: item.completed ? AppTheme.success : Colors.transparent, borderRadius: BorderRadius.circular(8), border: Border.all(color: item.completed ? AppTheme.success : AppTheme.textMuted, width: 2)),
          child: item.completed ? const Icon(Icons.check_rounded, color: Colors.white, size: 18) : null,
        ),
        title: Text(item.description, style: TextStyle(fontSize: 14, decoration: item.completed ? TextDecoration.lineThrough : null, color: item.completed ? AppTheme.textMuted : AppTheme.textPrimary)),
        subtitle: item.notes != null ? Text(item.notes!, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)) : null,
      ),
    );
  }
}

// ===== COMMENTS TAB =====
class _CommentsTab extends ConsumerStatefulWidget {
  final int taskId;
  const _CommentsTab({required this.taskId});
  @override
  ConsumerState<_CommentsTab> createState() => _CommentsTabState();
}

class _CommentsTabState extends ConsumerState<_CommentsTab> {
  final _controller = TextEditingController();
  List<dynamic> _comments = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _loadComments(); }
  @override
  void dispose() { _controller.dispose(); super.dispose(); }

  Future<void> _loadComments() async {
    setState(() => _loading = true);
    try { final res = await ApiClient().dio.get('/ppr/tasks/${widget.taskId}/comments'); _comments = res.data as List; } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _addComment() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    try { await ApiClient().dio.post('/ppr/tasks/${widget.taskId}/comments', data: {'commentText': text}); _controller.clear(); await _loadComments(); } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Expanded(
        child: _loading ? const Center(child: CircularProgressIndicator())
            : _comments.isEmpty ? const Center(child: Text("Izohlar yo'q", style: TextStyle(color: AppTheme.textMuted)))
            : ListView.builder(
                padding: const EdgeInsets.all(16), itemCount: _comments.length,
                itemBuilder: (_, i) {
                  final c = _comments[i];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.border)),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        CircleAvatar(radius: 14, backgroundColor: AppTheme.primary.withValues(alpha: 0.1), child: Text((c['authorName'] ?? 'U')[0], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.primary))),
                        const SizedBox(width: 8),
                        Expanded(child: Text(c['authorName'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
                        Text(_parseDateTime(c['createdAt']), style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                      ]),
                      const SizedBox(height: 8),
                      Text(c['commentText'] ?? '', style: const TextStyle(fontSize: 14, height: 1.4)),
                    ]),
                  );
                },
              ),
      ),
      Container(
        padding: EdgeInsets.fromLTRB(16, 8, 8, MediaQuery.of(context).padding.bottom + 8),
        decoration: BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppTheme.border))),
        child: Row(children: [
          Expanded(child: TextField(controller: _controller, decoration: const InputDecoration(hintText: 'Izoh yozing...', border: InputBorder.none, contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)), style: const TextStyle(fontSize: 14), maxLines: 3, minLines: 1)),
          IconButton(onPressed: _addComment, icon: Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: AppTheme.primary, borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.send_rounded, color: Colors.white, size: 18))),
        ]),
      ),
    ]);
  }
}

// ===== PHOTO + TIME TAB =====
class _PhotoTimeTab extends ConsumerStatefulWidget {
  final int taskId;
  const _PhotoTimeTab({required this.taskId});
  @override
  ConsumerState<_PhotoTimeTab> createState() => _PhotoTimeTabState();
}

class _PhotoTimeTabState extends ConsumerState<_PhotoTimeTab> {
  bool _uploading = false;

  Future<void> _uploadPhoto(String type) async {
    final picker = ImagePicker();
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => SafeArea(child: Column(mainAxisSize: MainAxisSize.min, children: [
        ListTile(leading: const Icon(Icons.camera_alt_rounded, color: AppTheme.primary), title: const Text('Kameradan'), onTap: () => Navigator.pop(ctx, ImageSource.camera)),
        ListTile(leading: const Icon(Icons.photo_library_rounded, color: AppTheme.secondary), title: const Text('Galereyadan'), onTap: () => Navigator.pop(ctx, ImageSource.gallery)),
      ])),
    );
    if (source == null) return;

    final image = await picker.pickImage(source: source, imageQuality: 70, maxWidth: 1920);
    if (image == null) return;

    setState(() => _uploading = true);
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(image.path, filename: image.name),
        'type': type,
      });
      await ApiClient().dio.post('/ppr/tasks/${widget.taskId}/photos', data: formData, options: Options(contentType: 'multipart/form-data'));
      ref.invalidate(taskPhotosProvider(widget.taskId));
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Foto yuklandi ✅'), backgroundColor: AppTheme.success));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Xato: $e'), backgroundColor: AppTheme.danger));
    }
    if (mounted) setState(() => _uploading = false);
  }

  Future<void> _addTimeEntry() async {
    final hoursCtrl = TextEditingController();
    final minutesCtrl = TextEditingController();
    final descCtrl = TextEditingController();

    final result = await showModalBottomSheet<bool>(
      context: context, isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('⏱️ Vaqt kiritish', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 16),
          Row(children: [
            Expanded(child: TextField(controller: hoursCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Soat', prefixIcon: Icon(Icons.schedule)))),
            const SizedBox(width: 12),
            Expanded(child: TextField(controller: minutesCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Daqiqa', prefixIcon: Icon(Icons.timer)))),
          ]),
          const SizedBox(height: 12),
          TextField(controller: descCtrl, decoration: const InputDecoration(labelText: 'Izoh (ixtiyoriy)', prefixIcon: Icon(Icons.notes))),
          const SizedBox(height: 20),
          SizedBox(width: double.infinity, child: FilledButton(
            onPressed: () async {
              final hours = int.tryParse(hoursCtrl.text) ?? 0;
              final minutes = int.tryParse(minutesCtrl.text) ?? 0;
              final total = hours * 60 + minutes;
              if (total <= 0) { ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Vaqtni kiriting'))); return; }
              try {
                final now = DateTime.now();
                await ApiClient().dio.post('/ppr/tasks/${widget.taskId}/time-entries', data: {
                  'startTime': now.subtract(Duration(minutes: total)).toIso8601String(),
                  'endTime': now.toIso8601String(),
                  'durationMinutes': total,
                  'description': descCtrl.text.trim().isEmpty ? null : descCtrl.text.trim(),
                });
                if (ctx.mounted) Navigator.pop(ctx, true);
              } catch (e) { if (ctx.mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Xato: $e'), backgroundColor: AppTheme.danger)); }
            },
            child: const Text('Saqlash'),
          )),
        ]),
      ),
    );
    if (result == true) {
      ref.invalidate(timeEntriesProvider(widget.taskId));
      ref.invalidate(totalTimeProvider(widget.taskId));
    }
  }

  @override
  Widget build(BuildContext context) {
    final photosAsync = ref.watch(taskPhotosProvider(widget.taskId));
    final totalAsync = ref.watch(totalTimeProvider(widget.taskId));

    return ListView(padding: const EdgeInsets.all(16), children: [
      // Foto bo'limi
      const Text('📸 Fotosuratlar', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
      const SizedBox(height: 12),
      Row(children: [
        Expanded(child: _UploadButton(label: 'Oldin', icon: Icons.photo_camera_back_rounded, color: AppTheme.warning, loading: _uploading, onTap: () => _uploadPhoto('BEFORE'))),
        const SizedBox(width: 12),
        Expanded(child: _UploadButton(label: 'Keyin', icon: Icons.photo_camera_front_rounded, color: AppTheme.success, loading: _uploading, onTap: () => _uploadPhoto('AFTER'))),
      ]),
      const SizedBox(height: 12),

      photosAsync.when(
        data: (photos) {
          if (photos.isEmpty) return Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: AppTheme.bgMain, borderRadius: BorderRadius.circular(14)), child: const Center(child: Text("Foto yo'q", style: TextStyle(color: AppTheme.textMuted))));
          final before = photos.where((p) => p.photoType == 'BEFORE').toList();
          final after = photos.where((p) => p.photoType == 'AFTER').toList();
          return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            if (before.isNotEmpty) ...[
              Text('Oldin (${before.length})', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.warning)),
              const SizedBox(height: 8),
              SizedBox(height: 100, child: ListView.builder(scrollDirection: Axis.horizontal, itemCount: before.length, itemBuilder: (_, i) => _PhotoThumbnail(photo: before[i]))),
              const SizedBox(height: 12),
            ],
            if (after.isNotEmpty) ...[
              Text('Keyin (${after.length})', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.success)),
              const SizedBox(height: 8),
              SizedBox(height: 100, child: ListView.builder(scrollDirection: Axis.horizontal, itemCount: after.length, itemBuilder: (_, i) => _PhotoThumbnail(photo: after[i]))),
            ],
          ]);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Text("Fotolarni yuklashda xato"),
      ),

      const SizedBox(height: 24),
      // Vaqt bo'limi
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        const Text('⏱️ Sarflangan vaqt', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
        FilledButton.icon(onPressed: _addTimeEntry, icon: const Icon(Icons.add, size: 16), label: const Text('Vaqt kiritish', style: TextStyle(fontSize: 12)), style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8))),
      ]),
      const SizedBox(height: 12),
      totalAsync.when(
        data: (total) => Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: AppTheme.primary.withValues(alpha: 0.06), borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.primary.withValues(alpha: 0.15))),
          child: Row(children: [
            const Icon(Icons.timer_rounded, color: AppTheme.primary),
            const SizedBox(width: 12),
            Text('Jami: ${total ~/ 60} soat ${total % 60} daqiqa', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppTheme.primary)),
          ]),
        ),
        loading: () => const SizedBox.shrink(),
        error: (_, __) => const SizedBox.shrink(),
      ),
      const SizedBox(height: 80),
    ]);
  }
}

class _UploadButton extends StatelessWidget {
  final String label; final IconData icon; final Color color; final bool loading; final VoidCallback onTap;
  const _UploadButton({required this.label, required this.icon, required this.color, required this.loading, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(onTap: loading ? null : onTap, child: Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(14), border: Border.all(color: color.withValues(alpha: 0.2))),
      child: Column(children: [
        loading ? SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: color)) : Icon(icon, color: color, size: 28),
        const SizedBox(height: 6),
        Text('📷 $label', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color)),
      ]),
    ));
  }
}

class _PhotoThumbnail extends StatelessWidget {
  final TaskPhoto photo;
  const _PhotoThumbnail({required this.photo});
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 100, height: 100, margin: const EdgeInsets.only(right: 8),
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: AppTheme.bgMain, border: Border.all(color: AppTheme.border)),
      child: photo.filePath != null
          ? ClipRRect(borderRadius: BorderRadius.circular(12), child: Image.network('${ApiClient().dio.options.baseUrl.replaceAll('/api/v1', '')}${photo.filePath}', fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.broken_image_rounded, color: AppTheme.textMuted)))
          : const Icon(Icons.photo_rounded, color: AppTheme.textMuted),
    );
  }
}

// ===== SHARED WIDGETS =====
class _Badge extends StatelessWidget {
  final String text; final Color color; final bool large;
  const _Badge({required this.text, required this.color, this.large = false});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: large ? 12 : 8, vertical: large ? 6 : 3),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
      child: Text(text, style: TextStyle(fontSize: large ? 12 : 10, fontWeight: FontWeight.w600, color: color)),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon; final String label; final String? value;
  const _DetailRow({required this.icon, required this.label, this.value});
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.border)),
      child: Row(children: [
        Icon(icon, size: 20, color: AppTheme.textMuted), const SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
          const SizedBox(height: 2),
          Text(value ?? '—', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        ])),
      ]),
    );
  }
}

String _parseDateTime(dynamic dt) {
  if (dt == null) return '';
  if (dt is String) return dt.length > 16 ? dt.substring(0, 16).replaceAll('T', ' ') : dt;
  if (dt is List && dt.length >= 5) return '${dt[0]}-${dt[1].toString().padLeft(2, '0')}-${dt[2].toString().padLeft(2, '0')} ${dt[3].toString().padLeft(2, '0')}:${dt[4].toString().padLeft(2, '0')}';
  return dt.toString();
}
