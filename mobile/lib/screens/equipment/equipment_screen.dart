import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../data/providers.dart';
import '../../data/models.dart';
import '../../data/api_client.dart';

class EquipmentListScreen extends ConsumerStatefulWidget {
  const EquipmentListScreen({super.key});
  @override
  ConsumerState<EquipmentListScreen> createState() => _EquipmentListScreenState();
}

class _EquipmentListScreenState extends ConsumerState<EquipmentListScreen> {
  final _searchController = TextEditingController();
  String _search = '';

  @override
  void dispose() { _searchController.dispose(); super.dispose(); }

  ListParams get _params => (page: 0, size: 100, search: _search, assignedToMe: null, overdue: null, status: null);

  @override
  Widget build(BuildContext context) {
    final listAsync = ref.watch(equipmentListProvider(_params));
    return Scaffold(
      appBar: AppBar(
        title: const Text('🖥️ Uskunalar'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: TextField(
              controller: _searchController,
              onChanged: (v) => setState(() => _search = v),
              decoration: InputDecoration(
                hintText: 'Qidirish: inv. raqami, nom...',
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                suffixIcon: _search.isNotEmpty ? IconButton(icon: const Icon(Icons.close, size: 18), onPressed: () { _searchController.clear(); setState(() => _search = ''); }) : null,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.border)),
                filled: true, fillColor: AppTheme.bgMain,
              ),
              style: const TextStyle(fontSize: 14),
            ),
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(equipmentListProvider(_params)),
        child: listAsync.when(
          data: (items) => items.isEmpty
              ? ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  children: [
                    SizedBox(height: MediaQuery.of(context).size.height * 0.3),
                    Icon(Icons.computer_rounded, size: 48, color: AppTheme.textMuted.withValues(alpha: 0.3)),
                    const SizedBox(height: 12),
                    const Text('Uskunalar topilmadi', style: TextStyle(color: AppTheme.textMuted), textAlign: TextAlign.center),
                  ],
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  physics: const AlwaysScrollableScrollPhysics(),
                  itemCount: items.length,
                  itemBuilder: (_, i) => _EquipmentCard(equipment: items[i], onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => EquipmentDetailScreen(id: items[i].id)))),
                ),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, s) => ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            children: [
              SizedBox(height: MediaQuery.of(context).size.height * 0.3),
              const Icon(Icons.cloud_off_rounded, size: 48, color: AppTheme.danger),
              const SizedBox(height: 12),
              Text('Xato: $e', style: const TextStyle(color: AppTheme.danger, fontSize: 12), textAlign: TextAlign.center),
              const SizedBox(height: 12),
              Center(child: OutlinedButton(onPressed: () => ref.invalidate(equipmentListProvider(_params)), child: const Text('Qayta urinish'))),
            ],
          ),
        ),
      ),
    );
  }
}

class _EquipmentCard extends StatelessWidget {
  final Equipment equipment; final VoidCallback onTap;
  const _EquipmentCard({required this.equipment, required this.onTap});

  Color _parseStatusColor() {
    if (equipment.statusColor == null) return AppTheme.textMuted;
    try { return Color(int.parse('FF${equipment.statusColor!.replaceFirst('#', '')}', radix: 16)); } catch (_) { return AppTheme.textMuted; }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _parseStatusColor();
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.border)),
        child: Row(children: [
          Container(width: 44, height: 44, decoration: BoxDecoration(color: AppTheme.primary.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.computer_rounded, color: AppTheme.primary, size: 22)),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(equipment.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 2),
            Text(equipment.inventoryNumber, style: const TextStyle(fontSize: 12, color: AppTheme.primary, fontWeight: FontWeight.w500)),
            const SizedBox(height: 4),
            Row(children: [
              if (equipment.locationName != null) ...[
                const Icon(Icons.location_on_outlined, size: 12, color: AppTheme.textMuted), const SizedBox(width: 2),
                Flexible(child: Text(equipment.locationName!, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted), maxLines: 1, overflow: TextOverflow.ellipsis)),
              ],
            ]),
          ])),
          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)), child: Text(equipment.statusName ?? '—', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: statusColor))),
          const SizedBox(width: 4),
          const Icon(Icons.chevron_right_rounded, color: AppTheme.textMuted, size: 20),
        ]),
      ),
    );
  }
}

// ===== EQUIPMENT DETAIL SCREEN =====
class EquipmentDetailScreen extends ConsumerWidget {
  final int id;
  const EquipmentDetailScreen({super.key, required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(equipmentDetailProvider(id));
    return detailAsync.when(
      data: (eq) => _DetailBody(equipment: eq),
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, s) => Scaffold(appBar: AppBar(title: const Text('Xato')), body: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text('$e', style: const TextStyle(color: AppTheme.danger)),
        const SizedBox(height: 12),
        OutlinedButton(onPressed: () => ref.invalidate(equipmentDetailProvider(id)), child: const Text('Qayta urinish')),
      ]))),
    );
  }
}

class _DetailBody extends ConsumerWidget {
  final Equipment equipment;
  const _DetailBody({required this.equipment});

  Color _parseColor() {
    if (equipment.statusColor == null) return AppTheme.textMuted;
    try { return Color(int.parse('FF${equipment.statusColor!.replaceFirst('#', '')}', radix: 16)); } catch (_) { return AppTheme.textMuted; }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusColor = _parseColor();
    final historyAsync = ref.watch(statusHistoryProvider(equipment.id));

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: CustomScrollView(slivers: [
        SliverAppBar(
          expandedHeight: 180, pinned: true,
          title: const Text('Uskuna haqida', style: TextStyle(fontSize: 16)),
          flexibleSpace: FlexibleSpaceBar(
            background: Container(
              decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF1E3A5F), Color(0xFF2563EB)])),
              child: SafeArea(child: Padding(padding: const EdgeInsets.fromLTRB(20, 48, 20, 20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.end, children: [
                Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(8), border: Border.all(color: statusColor.withValues(alpha: 0.4))), child: Text(equipment.statusName ?? '—', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600))),
                const SizedBox(height: 8),
                Text(equipment.name, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
                Text(equipment.inventoryNumber, style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 14)),
              ]))),
            ),
          ),
          foregroundColor: Colors.white,
        ),
      SliverPadding(padding: const EdgeInsets.all(16), sliver: SliverList(delegate: SliverChildListDelegate([
        _SectionTitle(title: "Asosiy ma'lumotlar"),
        _InfoCard(children: [
          _InfoRow(icon: Icons.category_rounded, label: 'Toifa', value: equipment.categoryName),
          _InfoRow(icon: Icons.factory_rounded, label: 'Ishlab chiqaruvchi', value: equipment.manufacturerName),
          _InfoRow(icon: Icons.devices_rounded, label: 'Model', value: equipment.modelName),
          _InfoRow(icon: Icons.tag_rounded, label: 'Seriya raqami', value: equipment.serialNumber),
          _InfoRow(icon: Icons.location_on_rounded, label: 'Joylashuv', value: equipment.locationName),
          _InfoRow(icon: Icons.person_rounded, label: "Mas'ul shaxs", value: equipment.responsiblePersonName),
        ]),
        const SizedBox(height: 16),
        _SectionTitle(title: "Moliyaviy ma'lumotlar"),
        _InfoCard(children: [
          _InfoRow(icon: Icons.calendar_today_rounded, label: 'Foydalanishga topshirilgan', value: equipment.commissionedDate),
          _InfoRow(icon: Icons.verified_rounded, label: 'Kafolat muddati', value: equipment.warrantyDate),
          _InfoRow(icon: Icons.attach_money_rounded, label: 'Narxi', value: equipment.purchasePrice != null ? "${equipment.purchasePrice!.toStringAsFixed(0)} so'm" : null),
        ]),
        if (equipment.notes != null && equipment.notes!.isNotEmpty) ...[
          const SizedBox(height: 16),
          _SectionTitle(title: 'Izoh'),
          Container(width: double.infinity, padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.border)), child: Text(equipment.notes!, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.5))),
        ],
        // Status tarixi
        const SizedBox(height: 16),
        _SectionTitle(title: 'Status tarixi'),
        historyAsync.when(
          data: (history) => history.isEmpty
              ? Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: AppTheme.bgMain, borderRadius: BorderRadius.circular(14)), child: const Center(child: Text("Tarix yo'q", style: TextStyle(color: AppTheme.textMuted))))
              : Column(children: history.map((h) => Container(
                  margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.border)),
                  child: Row(children: [
                    Container(width: 4, height: 40, decoration: BoxDecoration(color: _colorFromHex(h.newStatusColor), borderRadius: BorderRadius.circular(2))),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        if (h.oldStatusName != null) ...[Text(h.oldStatusName!, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)), const Text(' → ', style: TextStyle(fontSize: 12))],
                        Text(h.newStatusName ?? '', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      ]),
                      if (h.reason != null) Text(h.reason!, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                      if (h.changedByName != null || h.createdAt != null) Text('${h.changedByName ?? ''} ${h.createdAt != null ? "• ${h.createdAt!.substring(0, h.createdAt!.length > 16 ? 16 : h.createdAt!.length)}" : ""}', style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                    ])),
                  ]),
                )).toList()),
          loading: () => const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator(strokeWidth: 2))),
          error: (_, __) => const SizedBox.shrink(),
        ),
        // QR-kod
        const SizedBox(height: 16),
        _SectionTitle(title: 'QR-kod'),
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.border)),
          child: Column(children: [
            Container(width: 120, height: 120, decoration: BoxDecoration(color: AppTheme.bgMain, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppTheme.border)), child: const Icon(Icons.qr_code_2_rounded, size: 80, color: AppTheme.textSecondary)),
            const SizedBox(height: 12),
            SizedBox(width: double.infinity, child: ElevatedButton.icon(
              onPressed: () async {
                try {
                  await ApiClient().dio.post('/equipment/${equipment.id}/qr-code/generate');
                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('QR-kod yaratildi ✅'), backgroundColor: AppTheme.success));
                } catch (_) {}
              },
              icon: const Icon(Icons.qr_code_rounded, size: 18),
              label: const Text('QR yaratish'),
            )),
          ]),
        ),
        const SizedBox(height: 80),
      ]))),
    ]),
    );
  }

  Color _colorFromHex(String? hex) {
    if (hex == null) return AppTheme.textMuted;
    try { return Color(int.parse('FF${hex.replaceFirst('#', '')}', radix: 16)); } catch (_) { return AppTheme.textMuted; }
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle({required this.title});
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.only(bottom: 10), child: Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)));
}

class _InfoCard extends StatelessWidget {
  final List<Widget> children;
  const _InfoCard({required this.children});
  @override
  Widget build(BuildContext context) => Container(padding: const EdgeInsets.all(4), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.border)), child: Column(children: children));
}

class _InfoRow extends StatelessWidget {
  final IconData icon; final String label; final String? value;
  const _InfoRow({required this.icon, required this.label, this.value});
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10), child: Row(children: [
    Icon(icon, size: 18, color: AppTheme.textMuted), const SizedBox(width: 12),
    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
      const SizedBox(height: 2),
      Text(value ?? '—', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
    ])),
  ]));
}
