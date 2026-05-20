import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../data/api_client.dart';

// ===== ARIZALAR RO'YXATI =====
class RequestsScreen extends ConsumerStatefulWidget {
  const RequestsScreen({super.key});

  @override
  ConsumerState<RequestsScreen> createState() => _RequestsScreenState();
}

class _RequestsScreenState extends ConsumerState<RequestsScreen> {
  List<dynamic> _requests = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().dio.get('/requests/my');
      _requests = res.data is List ? res.data : (res.data['content'] ?? []);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('📋 Mening arizalarim')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final created = await Navigator.push<bool>(context, MaterialPageRoute(builder: (_) => const CreateRequestScreen()));
          if (created == true) _load();
        },
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Yangi ariza', style: TextStyle(fontWeight: FontWeight.w600)),
        elevation: 4,
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _requests.isEmpty
                ? ListView(children: [
                    SizedBox(height: MediaQuery.of(context).size.height * 0.3),
                    Column(children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withValues(alpha: 0.08),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.inbox_rounded, size: 48, color: AppTheme.primary),
                      ),
                      const SizedBox(height: 16),
                      const Text('Arizalar yo\'q', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.textSecondary)),
                      const SizedBox(height: 6),
                      const Text('Yangi ariza yaratish uchun tugmani bosing', style: TextStyle(fontSize: 13, color: AppTheme.textMuted)),
                    ]),
                  ])
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                    itemCount: _requests.length,
                    itemBuilder: (_, i) => _RequestCard(data: _requests[i]),
                  ),
      ),
    );
  }
}

class _RequestCard extends StatelessWidget {
  final dynamic data;
  const _RequestCard({required this.data});

  Color _statusColor(String? status) => switch (status) {
        'NEW' => AppTheme.info,
        'IN_REVIEW' => AppTheme.warning,
        'APPROVED' => AppTheme.success,
        'REJECTED' => AppTheme.danger,
        _ => AppTheme.textMuted,
      };

  String _statusLabel(String? status) => switch (status) {
        'NEW' => '🆕 Yangi',
        'IN_REVIEW' => '👁️ Ko\'rilmoqda',
        'APPROVED' => '✅ Tasdiqlangan',
        'REJECTED' => '❌ Rad etilgan',
        _ => status ?? '—',
      };

  IconData _typeIcon(String? type) => switch (type) {
        'REPAIR' => Icons.build_circle_rounded,
        'SPARE_PART' => Icons.settings_rounded,
        'TRANSFER' => Icons.swap_horiz_rounded,
        _ => Icons.help_outline_rounded,
      };

  @override
  Widget build(BuildContext context) {
    final status = data['status'] as String?;
    final type = data['type'] as String?;
    final sColor = _statusColor(status);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.border),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [sColor.withValues(alpha: 0.15), sColor.withValues(alpha: 0.05)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(13),
                  ),
                  child: Icon(_typeIcon(type), color: sColor, size: 22),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(data['subject'] ?? 'Ariza', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                      const SizedBox(height: 4),
                      Text(data['description'] ?? '', style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.3), maxLines: 2, overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: AppTheme.bgMain,
              borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(18), bottomRight: Radius.circular(18)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: sColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                  child: Text(_statusLabel(status), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: sColor)),
                ),
                const Spacer(),
                Icon(Icons.access_time_rounded, size: 13, color: AppTheme.textMuted),
                const SizedBox(width: 4),
                Text(data['createdAt'] ?? '', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ===== ARIZA YARATISH =====
class CreateRequestScreen extends StatefulWidget {
  const CreateRequestScreen({super.key});

  @override
  State<CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends State<CreateRequestScreen> {
  final _subjectController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _type = 'REPAIR';
  String _priority = 'NORMAL';
  bool _submitting = false;

  final _types = [
    {'value': 'REPAIR', 'label': "🔧 Ta'mirlash so'rovi", 'color': AppTheme.warning},
    {'value': 'SPARE_PART', 'label': "⚙️ Ehtiyot qism so'rovi", 'color': AppTheme.info},
    {'value': 'TRANSFER', 'label': "🔄 Uskuna ko'chirish", 'color': AppTheme.secondary},
    {'value': 'OTHER', 'label': '📝 Boshqa', 'color': AppTheme.textSecondary},
  ];

  final _priorities = [
    {'value': 'LOW', 'label': '🟢 Past', 'color': AppTheme.success},
    {'value': 'NORMAL', 'label': '🟡 O\'rta', 'color': AppTheme.warning},
    {'value': 'HIGH', 'label': '🔴 Yuqori', 'color': AppTheme.danger},
  ];

  @override
  void dispose() {
    _subjectController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_subjectController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mavzuni kiriting'), backgroundColor: AppTheme.danger));
      return;
    }
    setState(() => _submitting = true);
    try {
      await ApiClient().dio.post('/requests', data: {
        'subject': _subjectController.text.trim(),
        'description': _descriptionController.text.trim(),
        'type': _type,
        'priority': _priority,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('✅ Ariza yuborildi!'), backgroundColor: AppTheme.success));
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Xato: $e'), backgroundColor: AppTheme.danger));
    }
    if (mounted) setState(() => _submitting = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Yangi ariza'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: FilledButton(
              onPressed: _submitting ? null : _submit,
              style: FilledButton.styleFrom(backgroundColor: AppTheme.primary),
              child: _submitting
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Yuborish'),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Ariza turi
          const Text('Ariza turi', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _types.map((t) {
              final selected = _type == t['value'];
              final color = t['color'] as Color;
              return GestureDetector(
                onTap: () => setState(() => _type = t['value'] as String),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: selected ? color.withValues(alpha: 0.12) : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: selected ? color : AppTheme.border, width: selected ? 2 : 1),
                  ),
                  child: Text(t['label'] as String, style: TextStyle(fontSize: 13, fontWeight: selected ? FontWeight.w600 : FontWeight.w400, color: selected ? color : AppTheme.textSecondary)),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),

          // Mavzu
          const Text('Mavzu *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(height: 8),
          TextField(
            controller: _subjectController,
            decoration: const InputDecoration(hintText: 'Masalan: Printer ishlamayapti'),
            textCapitalization: TextCapitalization.sentences,
          ),
          const SizedBox(height: 20),

          // Tavsif
          const Text('Batafsil tavsif', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(height: 8),
          TextField(
            controller: _descriptionController,
            maxLines: 5,
            decoration: const InputDecoration(hintText: 'Muammoni batafsil tavsiflang...', alignLabelWithHint: true),
            textCapitalization: TextCapitalization.sentences,
          ),
          const SizedBox(height: 24),

          // Ustuvorlik
          const Text('Ustuvorlik', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(height: 10),
          Row(
            children: _priorities.map((p) {
              final selected = _priority == p['value'];
              final color = p['color'] as Color;
              return Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _priority = p['value'] as String),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    decoration: BoxDecoration(
                      color: selected ? color.withValues(alpha: 0.12) : Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: selected ? color : AppTheme.border, width: selected ? 2 : 1),
                    ),
                    child: Center(
                      child: Text(p['label'] as String, style: TextStyle(fontSize: 13, fontWeight: selected ? FontWeight.w700 : FontWeight.w400, color: selected ? color : AppTheme.textSecondary)),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
