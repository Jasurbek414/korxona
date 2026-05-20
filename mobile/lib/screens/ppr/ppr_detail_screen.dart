import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

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
                if (task.status == 'SCHEDULED')
                  const PopupMenuItem(value: 'IN_PROGRESS', child: Text('▶️ Boshlash')),
                if (task.status == 'IN_PROGRESS')
                  const PopupMenuItem(value: 'COMPLETED', child: Text('✅ Yakunlash')),
              ],
            ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textMuted,
          indicatorColor: AppTheme.primary,
          labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          tabs: const [
            Tab(text: 'Ma\'lumot'),
            Tab(text: 'Chek-list'),
            Tab(text: 'Izohlar'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _InfoTab(task: task),
          _ChecklistTab(taskId: widget.taskId),
          _CommentsTab(taskId: widget.taskId),
        ],
      ),
    );
  }

  Future<void> _changeStatus(String newStatus) async {
    try {
      await ApiClient().dio.patch('/ppr/tasks/${widget.taskId}/status', data: {'status': newStatus});
      ref.invalidate(pprTaskDetailProvider(widget.taskId));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Status o\'zgartirildi: $newStatus'), backgroundColor: AppTheme.success),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Xato: $e'), backgroundColor: AppTheme.danger),
        );
      }
    }
  }
}

// ===== INFO TAB =====
class _InfoTab extends StatelessWidget {
  final PprTask task;
  const _InfoTab({required this.task});

  Color _statusColor() => switch (task.status) {
        'SCHEDULED' => AppTheme.info,
        'IN_PROGRESS' => AppTheme.warning,
        'COMPLETED' => AppTheme.success,
        'APPROVED' => const Color(0xFF059669),
        _ => AppTheme.textMuted,
      };

  Color _priorityColor() => switch (task.priority) {
        'CRITICAL' => AppTheme.danger,
        'HIGH' => const Color(0xFFF97316),
        'NORMAL' => AppTheme.info,
        _ => AppTheme.textMuted,
      };

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Status + Priority badges
        Row(
          children: [
            _Badge(text: task.status, color: _statusColor(), large: true),
            const SizedBox(width: 8),
            _Badge(text: task.priority, color: _priorityColor(), large: true),
            if (task.isOverdue) ...[
              const SizedBox(width: 8),
              _Badge(text: '⚠️ Muddati o\'tgan', color: AppTheme.danger, large: true),
            ],
          ],
        ),
        const SizedBox(height: 20),

        _DetailRow(icon: Icons.computer_rounded, label: 'Uskuna', value: task.equipmentName),
        _DetailRow(icon: Icons.build_rounded, label: 'PPR turi', value: task.pprTypeName),
        _DetailRow(icon: Icons.calendar_today_rounded, label: 'Rejalashtirilgan sana', value: task.scheduledDate),
        _DetailRow(icon: Icons.person_rounded, label: 'Mas\'ul', value: task.assignedToName),
        if (task.completionNotes != null) _DetailRow(icon: Icons.notes_rounded, label: 'Yakunlash izohi', value: task.completionNotes),
      ],
    );
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
        if (items.isEmpty) {
          return const Center(child: Text('Chek-list bo\'sh', style: TextStyle(color: AppTheme.textMuted)));
        }
        final done = items.where((i) => i.completed).length;
        final progress = items.isNotEmpty ? done / items.length : 0.0;

        return Column(
          children: [
            // Progress bar
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('$done / ${items.length} bajarildi', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      Text('${(progress * 100).toInt()}%', style: TextStyle(fontWeight: FontWeight.w700, color: progress == 1 ? AppTheme.success : AppTheme.primary)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 8,
                      backgroundColor: AppTheme.bgMain,
                      color: progress == 1 ? AppTheme.success : AppTheme.primary,
                    ),
                  ),
                ],
              ),
            ),
            // Items
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: items.length,
                itemBuilder: (_, i) => _ChecklistTile(
                  item: items[i],
                  taskId: taskId,
                  onToggle: () async {
                    try {
                      await ApiClient().dio.patch('/ppr/tasks/$taskId/checklist/${items[i].id}/toggle', data: {});
                      ref.invalidate(checklistProvider(taskId));
                    } catch (_) {}
                  },
                ),
              ),
            ),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, s) => Center(child: Text('Xato: $e')),
    );
  }
}

class _ChecklistTile extends StatelessWidget {
  final ChecklistItem item;
  final int taskId;
  final VoidCallback onToggle;
  const _ChecklistTile({required this.item, required this.taskId, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: item.completed ? AppTheme.success.withValues(alpha: 0.3) : AppTheme.border),
      ),
      child: ListTile(
        onTap: onToggle,
        leading: Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: item.completed ? AppTheme.success : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: item.completed ? AppTheme.success : AppTheme.textMuted, width: 2),
          ),
          child: item.completed ? const Icon(Icons.check_rounded, color: Colors.white, size: 18) : null,
        ),
        title: Text(
          item.description,
          style: TextStyle(
            fontSize: 14,
            decoration: item.completed ? TextDecoration.lineThrough : null,
            color: item.completed ? AppTheme.textMuted : AppTheme.textPrimary,
          ),
        ),
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
  void initState() {
    super.initState();
    _loadComments();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _loadComments() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().dio.get('/ppr/tasks/${widget.taskId}/comments');
      _comments = res.data as List;
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _addComment() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    try {
      await ApiClient().dio.post('/ppr/tasks/${widget.taskId}/comments', data: {'commentText': text});
      _controller.clear();
      await _loadComments();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _comments.isEmpty
                  ? const Center(child: Text('Izohlar yo\'q', style: TextStyle(color: AppTheme.textMuted)))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _comments.length,
                      itemBuilder: (_, i) {
                        final c = _comments[i];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(
                                    radius: 14,
                                    backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                                    child: Text((c['authorName'] ?? 'U')[0], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.primary)),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(child: Text(c['authorName'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
                                  Text(c['createdAt'] ?? '', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(c['commentText'] ?? '', style: const TextStyle(fontSize: 14, height: 1.4)),
                            ],
                          ),
                        );
                      },
                    ),
        ),
        // Input
        Container(
          padding: EdgeInsets.fromLTRB(16, 8, 8, MediaQuery.of(context).padding.bottom + 8),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: AppTheme.border)),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  decoration: const InputDecoration(
                    hintText: 'Izoh yozing...',
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                  style: const TextStyle(fontSize: 14),
                  maxLines: 3,
                  minLines: 1,
                ),
              ),
              IconButton(
                onPressed: _addComment,
                icon: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: AppTheme.primary, borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ===== SHARED WIDGETS =====
class _Badge extends StatelessWidget {
  final String text;
  final Color color;
  final bool large;
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
  final IconData icon;
  final String label;
  final String? value;
  const _DetailRow({required this.icon, required this.label, this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppTheme.textMuted),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                const SizedBox(height: 2),
                Text(value ?? '—', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
