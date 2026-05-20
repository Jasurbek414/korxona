import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../data/providers.dart';
import '../notifications/notifications_screen.dart';
import '../requests/requests_screen.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final kpiAsync = ref.watch(dashboardKpiProvider);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(dashboardKpiProvider),
        child: CustomScrollView(
          slivers: [
            // AppBar
            SliverAppBar(
              expandedHeight: 130,
              pinned: true,
              actions: [
                IconButton(
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
                  icon: Stack(
                    children: [
                      const Icon(Icons.notifications_outlined, color: Colors.white),
                      Positioned(right: 0, top: 0, child: Container(width: 8, height: 8, decoration: const BoxDecoration(color: AppTheme.danger, shape: BoxShape.circle))),
                    ],
                  ),
                ),
              ],
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(colors: [Color(0xFF2563EB), Color(0xFF6366F1)]),
                  ),
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 20,
                                backgroundColor: Colors.white.withValues(alpha: 0.2),
                                child: Text(
                                  user?.fullName.isNotEmpty == true ? user!.fullName[0].toUpperCase() : 'U',
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Salom, ${user?.fullName ?? ""}! 👋',
                                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                                    Text(user?.role == 'ADMIN' ? '👑 Administrator' : user?.role ?? '',
                                        style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                titlePadding: const EdgeInsets.only(left: 20, bottom: 14),
                title: const Text('Boshqaruv paneli', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
              ),
            ),

            // KPI cards
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: kpiAsync.when(
                data: (kpi) => SliverGrid.count(
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 1.5,
                  children: [
                    _KpiCard(title: 'Jami uskunalar', value: '${kpi.totalEquipment}', icon: Icons.computer_rounded, color: AppTheme.primary),
                    _KpiCard(title: 'Faol PPR', value: '${kpi.activePpr}', icon: Icons.build_rounded, color: AppTheme.warning),
                    _KpiCard(title: "Muddati o'tgan", value: '${kpi.overdueTasks}', icon: Icons.warning_rounded, color: AppTheme.danger),
                    _KpiCard(title: 'Kam qoldiq', value: '${kpi.lowStockAlerts}', icon: Icons.inventory_rounded, color: AppTheme.secondary),
                  ],
                ),
                loading: () => SliverGrid.count(
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 1.5,
                  children: List.generate(4, (_) => _ShimmerCard()),
                ),
                error: (e, s) => SliverToBoxAdapter(
                  child: Center(child: Text('Ma\'lumot yuklanmadi', style: TextStyle(color: AppTheme.textMuted))),
                ),
              ),
            ),

            // Tezkor harakatlar
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Tezkor harakatlar', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _QuickAction(icon: Icons.qr_code_scanner_rounded, label: 'QR Skanerlash', color: AppTheme.primary, onTap: () {}),
                        const SizedBox(width: 12),
                        _QuickAction(icon: Icons.add_task_rounded, label: 'Yangi ariza', color: AppTheme.success, onTap: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateRequestScreen()));
                        }),
                        const SizedBox(width: 12),
                        _QuickAction(icon: Icons.list_alt_rounded, label: 'Arizalarim', color: AppTheme.warning, onTap: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const RequestsScreen()));
                        }),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _KpiCard({required this.title, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: color, size: 20),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppTheme.textPrimary)),
              Text(title, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
            ],
          ),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickAction({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: color.withValues(alpha: 0.15)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(height: 6),
              Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color), textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}

class _ShimmerCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
    );
  }
}
