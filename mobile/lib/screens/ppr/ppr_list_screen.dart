import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../data/providers.dart';
import '../../data/models.dart';

class PprListScreen extends ConsumerStatefulWidget {
  const PprListScreen({super.key});

  @override
  ConsumerState<PprListScreen> createState() => _PprListScreenState();
}

class _PprListScreenState extends ConsumerState<PprListScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _statusFilters = ['', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'];
  final _statusLabels = ['Barchasi', 'Rejali', 'Jarayonda', 'Bajarilgan'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Map<String, dynamic> _params(int tabIndex) {
    final params = <String, dynamic>{'page': 0, 'size': 50};
    if (_statusFilters[tabIndex].isNotEmpty) params['status'] = _statusFilters[tabIndex];
    return params;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🔧 PPR vazifalari'),
        bottom: TabBar(
          controller: _tabController,
          onTap: (_) => setState(() {}),
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textMuted,
          indicatorColor: AppTheme.primary,
          labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          tabs: _statusLabels.map((l) => Tab(text: l)).toList(),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: List.generate(4, (tabIndex) {
          final tasksAsync = ref.watch(pprTasksProvider(_params(tabIndex)));
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(pprTasksProvider(_params(tabIndex))),
            child: tasksAsync.when(
              data: (tasks) => tasks.isEmpty
                  ? const Center(child: Text('Vazifalar topilmadi', style: TextStyle(color: AppTheme.textMuted)))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: tasks.length,
                      itemBuilder: (_, i) => _TaskCard(task: tasks[i]),
                    ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, s) => const Center(child: Text('Xato yuz berdi')),
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
    return Container(
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
              Expanded(
                child: Text(task.taskNumber ?? 'PPR #${task.id}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
              ),
              _Badge(text: task.status, color: _statusColor()),
              const SizedBox(width: 6),
              _Badge(text: task.priority, color: _priorityColor()),
            ],
          ),
          const SizedBox(height: 8),
          Text(task.equipmentName ?? '—', style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
          const SizedBox(height: 4),
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
              child: const Text('⚠️ Muddati o\'tgan', style: TextStyle(fontSize: 10, color: AppTheme.danger, fontWeight: FontWeight.w600)),
            ),
          ],
        ],
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
