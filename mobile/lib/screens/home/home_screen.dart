import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../data/providers.dart';
import '../notifications/notifications_screen.dart';
import '../requests/requests_screen.dart';
import '../scanner/qr_scanner_screen.dart';
import '../ppr/ppr_list_screen.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final kpiAsync = ref.watch(dashboardKpiProvider);
    final unreadAsync = ref.watch(unreadNotificationCountProvider);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(dashboardKpiProvider);
          ref.invalidate(unreadNotificationCountProvider);
        },
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
                      unreadAsync.when(
                        data: (count) => count > 0
                            ? Positioned(
                                right: 0,
                                top: 0,
                                child: Container(
                                  padding: const EdgeInsets.all(2),
                                  constraints: const BoxConstraints(minWidth: 14, minHeight: 14),
                                  decoration: const BoxDecoration(color: AppTheme.danger, shape: BoxShape.circle),
                                  child: Text('$count', style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
                                ),
                              )
                            : const SizedBox.shrink(),
                        loading: () => const SizedBox.shrink(),
                        error: (_, __) => const SizedBox.shrink(),
                      ),
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
                                    Text(user?.role == 'ADMIN' ? '👑 Administrator' : user?.role == 'OPERATOR' ? '🔧 Operator' : '👁️ Ko\'ruvchi',
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
                  childAspectRatio: 1.35,
                  children: [
                    _KpiCard(title: 'Jami uskunalar', value: '${kpi.totalEquipment}', icon: Icons.computer_rounded, color: AppTheme.primary),
                    _KpiCard(title: 'PPR vazifalari', value: '${kpi.activePpr}', subtitle: 'bajarildi: ${kpi.pprCompletedTasks}', icon: Icons.build_rounded, color: AppTheme.warning),
                    _KpiCard(title: "Muddati o'tgan", value: '${kpi.overdueTasks}', icon: Icons.warning_rounded, color: AppTheme.danger),
                    _KpiCard(title: 'Kam qoldiq', value: '${kpi.lowStockAlerts}', icon: Icons.inventory_rounded, color: AppTheme.secondary),
                  ],
                ),
                loading: () => SliverGrid.count(
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 1.35,
                  children: List.generate(4, (_) => _ShimmerCard()),
                ),
                error: (e, s) => SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppTheme.danger.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.danger.withValues(alpha: 0.2)),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.cloud_off_rounded, color: AppTheme.danger, size: 32),
                        const SizedBox(height: 8),
                        const Text("Ma'lumot yuklanmadi", style: TextStyle(color: AppTheme.danger, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 4),
                        Text('$e', style: const TextStyle(color: AppTheme.textMuted, fontSize: 11), maxLines: 2, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 12),
                        OutlinedButton.icon(
                          onPressed: () => ref.invalidate(dashboardKpiProvider),
                          icon: const Icon(Icons.refresh_rounded, size: 16),
                          label: const Text('Qayta urinish'),
                          style: OutlinedButton.styleFrom(foregroundColor: AppTheme.danger, side: const BorderSide(color: AppTheme.danger)),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // Bugungi vazifalar
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverToBoxAdapter(
                child: kpiAsync.when(
                  data: (kpi) => kpi.todayTasks > 0
                      ? Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [AppTheme.info.withValues(alpha: 0.08), AppTheme.info.withValues(alpha: 0.03)],
                            ),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppTheme.info.withValues(alpha: 0.2)),
                          ),
                          child: GestureDetector(
                            onTap: () {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const PprListScreen()));
                            },
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(color: AppTheme.info.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                                  child: const Icon(Icons.today_rounded, color: AppTheme.info, size: 22),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Bugungi vazifalar', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                                      Text('${kpi.todayTasks} ta vazifa bajarilishi kerak', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                                    ],
                                  ),
                                ),
                                const Icon(Icons.chevron_right_rounded, color: AppTheme.info),
                              ],
                            ),
                          ),
                        )
                      : const SizedBox.shrink(),
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                ),
              ),
            ),

            // PPR completion rate
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverToBoxAdapter(
                child: kpiAsync.when(
                  data: (kpi) => kpi.activePpr > 0
                      ? Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('PPR bajarilishi (bu oy)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                                  Text('${kpi.pprCompletionRate}%', style: TextStyle(fontWeight: FontWeight.w700, color: kpi.pprCompletionRate >= 80 ? AppTheme.success : AppTheme.warning)),
                                ],
                              ),
                              const SizedBox(height: 10),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(6),
                                child: LinearProgressIndicator(
                                  value: kpi.pprCompletionRate / 100.0,
                                  minHeight: 8,
                                  backgroundColor: AppTheme.bgMain,
                                  color: kpi.pprCompletionRate >= 80 ? AppTheme.success : kpi.pprCompletionRate >= 50 ? AppTheme.warning : AppTheme.danger,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text('${kpi.pprCompletedTasks} / ${kpi.activePpr} vazifa bajarildi', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                            ],
                          ),
                        )
                      : const SizedBox.shrink(),
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
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
                        _QuickAction(
                          icon: Icons.qr_code_scanner_rounded,
                          label: 'QR Skanerlash',
                          color: AppTheme.primary,
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const QrScannerFullScreen())),
                        ),
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
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _QuickAction(
                          icon: Icons.build_rounded,
                          label: 'PPR vazifalari',
                          color: const Color(0xFF8B5CF6),
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PprListScreen())),
                        ),
                        const SizedBox(width: 12),
                        _QuickAction(
                          icon: Icons.notifications_rounded,
                          label: 'Xabarnomalar',
                          color: const Color(0xFFEC4899),
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(child: SizedBox()), // placeholder
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

/// QR skanerlash uchun to'liq ekran (Dashboard dan ochiladi)
class QrScannerFullScreen extends StatelessWidget {
  const QrScannerFullScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const QrScannerScreen();
  }
}

class _KpiCard extends StatelessWidget {
  final String title;
  final String value;
  final String? subtitle;
  final IconData icon;
  final Color color;

  const _KpiCard({required this.title, required this.value, required this.icon, required this.color, this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
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
          const SizedBox(height: 4),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppTheme.textPrimary, height: 1.1)),
              ),
              const SizedBox(height: 2),
              Text(
                title,
                style: const TextStyle(fontSize: 11, color: AppTheme.textMuted, height: 1.1),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              if (subtitle != null)
                Text(subtitle!, style: TextStyle(fontSize: 9, color: color, fontWeight: FontWeight.w500, height: 1.3)),
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
