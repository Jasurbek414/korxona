import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../data/api_client.dart';
import '../../data/models.dart';

// ===== ARIZALAR RO'YXATI =====
class RequestsScreen extends ConsumerStatefulWidget {
  const RequestsScreen({super.key});

  @override
  ConsumerState<RequestsScreen> createState() => _RequestsScreenState();
}

class _RequestsScreenState extends ConsumerState<RequestsScreen> {
  List<UserRequest> _requests = [];
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
      final data = res.data;
      final content = data is Map ? (data['content'] as List?) ?? [] : data as List;
      _requests = content.map((e) => UserRequest.fromJson(e)).toList();
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
                    itemBuilder: (_, i) => _RequestCard(request: _requests[i]),
                  ),
      ),
    );
  }
}

class _RequestCard extends StatelessWidget {
  final UserRequest request;
  const _RequestCard({required this.request});

  Color _statusColor(String status) => switch (status) {
        'NEW' => AppTheme.info,
        'REVIEWING' => AppTheme.warning,
        'APPROVED' => AppTheme.success,
        'REJECTED' => AppTheme.danger,
        'COMPLETED' => const Color(0xFF059669),
        _ => AppTheme.textMuted,
      };

  String _statusLabel(String status) => switch (status) {
        'NEW' => '🆕 Yangi',
        'REVIEWING' => '👁️ Ko\'rilmoqda',
        'APPROVED' => '✅ Tasdiqlangan',
        'REJECTED' => '❌ Rad etilgan',
        'COMPLETED' => '🏁 Bajarildi',
        _ => status,
      };

  IconData _typeIcon(String type) => switch (type) {
        'REPAIR' => Icons.build_circle_rounded,
        'REPLACE' => Icons.swap_horiz_rounded,
        'OTHER' => Icons.help_outline_rounded,
        _ => Icons.assignment_rounded,
      };

  @override
  Widget build(BuildContext context) {
    final sColor = _statusColor(request.status);

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
                  child: Icon(_typeIcon(request.requestType), color: sColor, size: 22),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(request.requestNumber ?? '#${request.id}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.secondary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(request.typeLabel, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppTheme.secondary)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(request.description ?? '', style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.3), maxLines: 2, overflow: TextOverflow.ellipsis),
                      if (request.equipmentName != null) ...[
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.computer_rounded, size: 13, color: AppTheme.textMuted),
                            const SizedBox(width: 4),
                            Flexible(child: Text(request.equipmentName!, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted), maxLines: 1, overflow: TextOverflow.ellipsis)),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Footer
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
                  child: Text(_statusLabel(request.status), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: sColor)),
                ),
                const Spacer(),
                if (request.requestedByName != null) ...[
                  const Icon(Icons.person_outline_rounded, size: 13, color: AppTheme.textMuted),
                  const SizedBox(width: 4),
                  Text(request.requestedByName!, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                  const SizedBox(width: 12),
                ],
                const Icon(Icons.access_time_rounded, size: 13, color: AppTheme.textMuted),
                const SizedBox(width: 4),
                Text(
                  request.createdAt?.substring(0, 16).replaceAll('T', ' ') ?? '',
                  style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                ),
              ],
            ),
          ),
          // Admin javob izohi
          if (request.responseNotes != null && request.responseNotes!.isNotEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.info.withValues(alpha: 0.04),
                borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(18), bottomRight: Radius.circular(18)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.chat_bubble_outline_rounded, size: 14, color: AppTheme.info),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text.rich(
                      TextSpan(children: [
                        const TextSpan(text: 'Javob: ', style: TextStyle(fontWeight: FontWeight.w700, color: AppTheme.info, fontSize: 12)),
                        TextSpan(text: request.responseNotes!, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                      ]),
                    ),
                  ),
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
  final _descriptionController = TextEditingController();
  final _equipmentIdController = TextEditingController();
  String _type = 'REPAIR';
  bool _submitting = false;

  // Backend enum: REPAIR, REPLACE, OTHER
  final _types = [
    {'value': 'REPAIR', 'label': "🔧 Ta'mirlash so'rovi", 'color': AppTheme.warning},
    {'value': 'REPLACE', 'label': "🔄 Uskunani almashtirish", 'color': AppTheme.info},
    {'value': 'OTHER', 'label': '📝 Boshqa', 'color': AppTheme.textSecondary},
  ];

  @override
  void dispose() {
    _descriptionController.dispose();
    _equipmentIdController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final equipmentIdText = _equipmentIdController.text.trim();
    final description = _descriptionController.text.trim();

    if (equipmentIdText.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Uskuna ID sini kiriting'), backgroundColor: AppTheme.danger));
      return;
    }
    if (description.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tavsifni kiriting'), backgroundColor: AppTheme.danger));
      return;
    }

    final equipmentId = int.tryParse(equipmentIdText);
    if (equipmentId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Uskuna ID son bo\'lishi kerak'), backgroundColor: AppTheme.danger));
      return;
    }

    setState(() => _submitting = true);
    try {
      // Backend kutayotgan payload: { equipmentId, requestType, description }
      await ApiClient().dio.post('/requests', data: {
        'equipmentId': equipmentId,
        'requestType': _type,
        'description': description,
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

          // Uskuna ID
          const Text('Uskuna ID *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(height: 8),
          TextField(
            controller: _equipmentIdController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              hintText: 'Masalan: 1',
              prefixIcon: Icon(Icons.computer_rounded, size: 20),
            ),
          ),
          const SizedBox(height: 20),

          // Tavsif
          const Text('Batafsil tavsif *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(height: 8),
          TextField(
            controller: _descriptionController,
            maxLines: 5,
            decoration: const InputDecoration(
              hintText: 'Muammoni batafsil tavsiflang...',
              alignLabelWithHint: true,
              prefixIcon: Padding(
                padding: EdgeInsets.only(bottom: 80),
                child: Icon(Icons.description_rounded, size: 20),
              ),
            ),
            textCapitalization: TextCapitalization.sentences,
          ),
          const SizedBox(height: 24),

          // Info card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppTheme.info.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppTheme.info.withValues(alpha: 0.15)),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline_rounded, color: AppTheme.info, size: 20),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Ariza yuborilgach admin tomonidan ko\'rib chiqiladi. Status xabarnomalar orqali kuzatiladi.',
                    style: TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
