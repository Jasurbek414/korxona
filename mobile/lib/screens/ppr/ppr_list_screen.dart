import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../data/providers.dart';
import '../../data/models.dart';
import 'ppr_detail_screen.dart';

class PprListScreen extends ConsumerStatefulWidget {
  const PprListScreen({super.key});

  @override
  ConsumerState<PprListScreen> createState() => _PprListScreenState();
}

class _PprListScreenState extends ConsumerState<PprListScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchCtrl = TextEditingController();
  String _search = '';

  // TZ 2.5: Tab navigatsiya — Barchasi / Meniki / Muddati o'tgan / Status filtr
  final _tabs = ['Barchasi', 'Meniki', "Muddati o'tgan", 'Rejali', 'Jarayonda', 'Bajarilgan'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  Map<String, dynamic> _params(int tabIndex) {
    final params = <String, dynamic>{'page': 0, 'size': 50};
    if (_search.isNotEmpty) params['search'] = _search;

    switch (tabIndex) {
      case 0: break; // Barchasi
      case 1: params['assignedToMe'] = true; break; // Meniki
      case 2: params['overdue'] = true; break; // Muddati o'tgan
      case 3: params['status'] = 'SCHEDULED'; break;
      case 4: params['status'] = 'IN_PROGRESS'; break;
      case 5: params['status'] = 'COMPLETED'; break;
    }
    return params;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🔧 PPR vazifalari'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(92),
          child: Column(
            children: [
              // Qidiruv
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                child: SizedBox(
                  height: 40,
                  child: TextField(
                    controller: _searchCtrl,
                    onChanged: (v) => setState(() => _search = v),
                    decoration: InputDecoration(
                      hintText: 'Qidirish...',
                      prefixIcon: const Icon(Icons.search_rounded, size: 18),
                      suffixIcon: _search.isNotEmpty ? IconButton(icon: const Icon(Icons.close, size: 16), onPressed: () { _searchCtrl.clear(); setState(() => _search = ''); }) : null,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                      filled: true, fillColor: AppTheme.bgMain,
                    ),
                    style: const TextStyle(fontSize: 13),
                  ),
                ),
              ),
              TabBar(
                controller: _tabController,
                onTap: (_) => setState(() {}),
                labelColor: AppTheme.primary,
                unselectedLabelColor: AppTheme.textMuted,
                indicatorColor: AppTheme.primary,
                isScrollable: true,
                labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                tabAlignment: TabAlignment.start,
                tabs: _tabs.map((l) => Tab(text: l)).toList(),
              ),
            ],
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: List.generate(_tabs.length, (tabIndex) {
          final tasksAsync = ref.watch(pprTasksProvider(_params(tabIndex)));
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(pprTasksProvider(_params(tabIndex))),
            child: tasksAsync.when(
              data: (tasks) => tasks.isEmpty
                  ? ListView(children: [
                      SizedBox(height: MediaQuery.of(context).size.height * 0.25),
                      Column(children: [
                        Icon(Icons.assignment_rounded, size: 48, color: AppTheme.textMuted.withValues(alpha: 0.3)),
                        const SizedBox(height: 12),
                        const Text('Vazifalar topilmadi', style: TextStyle(color: AppTheme.textMuted, fontSize: 14)),
                      ]),
                    ])
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: tasks.length,
                      itemBuilder: (_, i) => _TaskCard(task: tasks[i]),
                    ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, s) => Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.cloud_off_rounded, size: 48, color: AppTheme.danger),
                const SizedBox(height: 12),
                Text('$e', style: const TextStyle(color: AppTheme.danger, fontSize: 12), textAlign: TextAlign.center),
                const SizedBox(height: 12),
                OutlinedButton(onPressed: () => ref.invalidate(pprTasksProvider(_params(tabIndex))), child: const Text('Qayta urinish')),
              ])),
            ),
          );
        }),
      ),
    );
  }
}

class _TaskCard extends StatelessWidget {
  final PprTask task;
  const _TaskCard({required this.task});

  void _openDetail(BuildContext context) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => PprDetailScreen(taskId: task.id)));
  }

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
    return GestureDetector(
      onTap: () => _openDetail(context),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: task.isOverdue ? AppTheme.danger.withValues(alpha: 0.3) : AppTheme.border),
          boxShadow: task.isOverdue ? [BoxShadow(color: AppTheme.danger.withValues(alpha: 0.08), blurRadius: 8)] : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: Text(task.taskNumber ?? 'PPR #${task.id}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14))),
                _Badge(text: task.statusLabel, color: _statusColor()),
                const SizedBox(width: 6),
                _Badge(text: task.priorityLabel, color: _priorityColor()),
              ],
            ),
            const SizedBox(height: 8),
            Row(children: [
              const Icon(Icons.computer_rounded, size: 14, color: AppTheme.textSecondary),
              const SizedBox(width: 4),
              Expanded(child: Text(task.equipmentName ?? '—', style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary))),
            ]),
            if (task.pprTypeName != null) ...[
              const SizedBox(height: 2),
              Row(children: [
                const Icon(Icons.build_rounded, size: 14, color: AppTheme.textMuted),
                const SizedBox(width: 4),
                Text(task.pprTypeName!, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
              ]),
            ],
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.calendar_today_rounded, size: 13, color: AppTheme.textMuted),
                const SizedBox(width: 4),
                Text(task.scheduledDate ?? '—', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                const Spacer(),
                const Icon(Icons.person_outline_rounded, size: 13, color: AppTheme.textMuted),
                const SizedBox(width: 4),
                Text(task.assignedToName ?? '—', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
              ],
            ),
            if (task.isOverdue) ...[
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: AppTheme.danger.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                child: Text(
                  "⚠️ Muddati o'tgan${task.overdueDays != null ? ' (${task.overdueDays} kun)' : ''}",
                  style: const TextStyle(fontSize: 10, color: AppTheme.danger, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String text;
  final Color color;
  const _Badge({required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
      child: Text(text, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
    );
  }
}
