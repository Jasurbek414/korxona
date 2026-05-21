import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../data/providers.dart';
import '../../data/models.dart';
import '../../data/api_client.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifAsync = ref.watch(notificationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('🔔 Xabarnomalar'),
        actions: [
          TextButton(
            onPressed: () async {
              try {
                await ApiClient().dio.patch('/notifications/read-all');
                ref.invalidate(notificationsProvider);
                ref.invalidate(unreadNotificationCountProvider);
              } catch (_) {}
            },
            child: const Text("Hammasini o'qish", style: TextStyle(fontSize: 12)),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(notificationsProvider);
          ref.invalidate(unreadNotificationCountProvider);
        },
        child: notifAsync.when(
          data: (notifications) {
            if (notifications.isEmpty) {
              // Bo'sh holat — statik demo
              return _buildStaticNotifications(context);
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: notifications.length,
              itemBuilder: (_, i) => _NotificationCard(notification: notifications[i], onTap: () async {
                try {
                  await ApiClient().dio.patch('/notifications/${notifications[i].id}/read');
                  ref.invalidate(notificationsProvider);
                  ref.invalidate(unreadNotificationCountProvider);
                } catch (_) {}
              }),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => _buildStaticNotifications(context),
        ),
      ),
    );
  }

  Widget _buildStaticNotifications(BuildContext context) {
    final notifications = [
      {'title': '⚠️ PPR muddati yaqinlashmoqda', 'body': "Server HP ProLiant — texnik ko'rik 3 kun ichida", 'time': '2 soat oldin', 'type': 'warning', 'read': false},
      {'title': '✅ Ariza tasdiqlandi', 'body': "Printer Canon ta'mirlash arizasi tasdiqlandi", 'time': '5 soat oldin', 'type': 'success', 'read': false},
      {'title': '🔧 Yangi vazifa tayinlandi', 'body': "Konditsioner Daikin — profilaktik ko'rik", 'time': 'Kecha', 'type': 'info', 'read': true},
      {'title': '📦 Kam qoldiq ogohlantirish', 'body': 'Toner kartridji (HP 26A) — 2 dona qoldi', 'time': '2 kun oldin', 'type': 'danger', 'read': true},
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: notifications.length,
      itemBuilder: (_, i) {
        final n = notifications[i];
        final isRead = n['read'] as bool;
        final type = n['type'] as String;
        final color = switch (type) { 'warning' => AppTheme.warning, 'success' => AppTheme.success, 'danger' => AppTheme.danger, _ => AppTheme.info };
        final icon = switch (type) { 'warning' => Icons.schedule_rounded, 'success' => Icons.check_circle_rounded, 'danger' => Icons.inventory_rounded, _ => Icons.assignment_rounded };

        return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(
            color: isRead ? Colors.white : color.withValues(alpha: 0.03),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isRead ? AppTheme.border : color.withValues(alpha: 0.2)),
            boxShadow: isRead ? null : [BoxShadow(color: color.withValues(alpha: 0.06), blurRadius: 8)],
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: Container(
              width: 44, height: 44,
              decoration: BoxDecoration(gradient: LinearGradient(colors: [color.withValues(alpha: 0.15), color.withValues(alpha: 0.05)], begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(13)),
              child: Icon(icon, color: color, size: 22),
            ),
            title: Row(children: [
              Expanded(child: Text(n['title'] as String, style: TextStyle(fontWeight: isRead ? FontWeight.w500 : FontWeight.w700, fontSize: 14))),
              if (!isRead) Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
            ]),
            subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const SizedBox(height: 4),
              Text(n['body'] as String, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.3)),
              const SizedBox(height: 6),
              Text(n['time'] as String, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
            ]),
          ),
        );
      },
    );
  }
}

class _NotificationCard extends StatelessWidget {
  final AppNotification notification;
  final VoidCallback onTap;
  const _NotificationCard({required this.notification, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final type = notification.type ?? 'info';
    final color = switch (type) { 'warning' || 'ppr_upcoming' => AppTheme.warning, 'success' || 'request_approved' => AppTheme.success, 'danger' || 'low_stock' || 'ppr_overdue' => AppTheme.danger, _ => AppTheme.info };
    final icon = switch (type) { 'warning' || 'ppr_upcoming' => Icons.schedule_rounded, 'success' || 'request_approved' => Icons.check_circle_rounded, 'danger' || 'low_stock' => Icons.inventory_rounded, 'ppr_overdue' => Icons.warning_rounded, _ => Icons.notifications_rounded };

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: notification.isRead ? Colors.white : color.withValues(alpha: 0.03),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: notification.isRead ? AppTheme.border : color.withValues(alpha: 0.2)),
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          leading: Container(
            width: 44, height: 44,
            decoration: BoxDecoration(gradient: LinearGradient(colors: [color.withValues(alpha: 0.15), color.withValues(alpha: 0.05)]), borderRadius: BorderRadius.circular(13)),
            child: Icon(icon, color: color, size: 22),
          ),
          title: Row(children: [
            Expanded(child: Text(notification.title, style: TextStyle(fontWeight: notification.isRead ? FontWeight.w500 : FontWeight.w700, fontSize: 14))),
            if (!notification.isRead) Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          ]),
          subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            if (notification.message != null) ...[const SizedBox(height: 4), Text(notification.message!, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.3))],
            const SizedBox(height: 6),
            Text(notification.createdAt ?? '', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
          ]),
        ),
      ),
    );
  }
}
