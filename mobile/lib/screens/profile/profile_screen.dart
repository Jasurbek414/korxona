import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../data/providers.dart';
import '../../data/api_client.dart';
import '../notifications/notifications_screen.dart';
import '../requests/requests_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    if (user == null) return const SizedBox.shrink();

    final initials = user.fullName.split(' ').map((w) => w.isNotEmpty ? w[0] : '').join().toUpperCase();

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Gradient header
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF1E3A5F), Color(0xFF2563EB), Color(0xFF6366F1)],
                  ),
                ),
                child: SafeArea(
                  child: Center(
                    child: SingleChildScrollView(
                      physics: const NeverScrollableScrollPhysics(),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(height: 16),
                          // Avatar
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: [Color(0xFF60A5FA), Color(0xFFA78BFA)]),
                              borderRadius: BorderRadius.circular(24),
                              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 20, offset: const Offset(0, 8))],
                            ),
                            child: Center(child: Text(initials, style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w700))),
                          ),
                          const SizedBox(height: 14),
                          Text(user.fullName, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 4),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              title: Text(user.fullName, style: const TextStyle(fontSize: 16)),
            ),
            foregroundColor: Colors.white,
          ),

          // Content
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Shaxsiy ma'lumotlar
                _SectionLabel(text: 'Shaxsiy ma\'lumotlar'),
                _InfoTile(icon: Icons.person_rounded, label: 'F.I.O.', value: user.fullName, color: AppTheme.primary),
                _InfoTile(icon: Icons.alternate_email_rounded, label: 'Username', value: '@${user.username}', color: AppTheme.secondary),
                _InfoTile(icon: Icons.email_rounded, label: 'Email', value: user.email ?? 'Kiritilmagan', color: AppTheme.info),
                _InfoTile(icon: Icons.phone_rounded, label: 'Telefon', value: user.phone ?? 'Kiritilmagan', color: AppTheme.success),
                const SizedBox(height: 20),

                // Tezkor harakatlar
                _SectionLabel(text: 'Harakatlar'),
                _ActionCard(
                  icon: Icons.notifications_rounded,
                  label: 'Xabarnomalar',
                  subtitle: '4 ta yangi xabar',
                  color: AppTheme.warning,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
                ),
                _ActionCard(
                  icon: Icons.assignment_rounded,
                  label: 'Mening arizalarim',
                  subtitle: 'Barcha arizalaringiz',
                  color: AppTheme.info,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RequestsScreen())),
                ),
                _ActionCard(
                  icon: Icons.edit_rounded,
                  label: 'Ma\'lumotlarni tahrirlash',
                  subtitle: 'F.I.O., Email, Telefon',
                  color: AppTheme.primary,
                  onTap: () => _showEditProfileDialog(context, user, ref),
                ),
                _ActionCard(
                  icon: Icons.lock_rounded,
                  label: 'Parolni o\'zgartirish',
                  subtitle: 'Xavfsizlik sozlamalari',
                  color: AppTheme.secondary,
                  onTap: () => _showChangePasswordDialog(context),
                ),
                const SizedBox(height: 20),

                // Sozlamalar
                _SectionLabel(text: 'Sozlamalar'),
                _SettingsTile(icon: Icons.language_rounded, label: 'Til', trailing: 'O\'zbekcha'),
                _SettingsTile(icon: Icons.dark_mode_rounded, label: 'Qorong\'i rejim', trailing: 'O\'chiq'),
                _SettingsTile(
                  icon: Icons.info_outline_rounded,
                  label: 'Ilova haqida',
                  trailing: 'v1.0.0',
                  onTap: () => showAboutDialog(
                    context: context,
                    applicationName: 'Uskunalar Boshqaruvi',
                    applicationVersion: '1.0.0',
                    applicationLegalese: '© 2026 Boshliq',
                  ),
                ),
                const SizedBox(height: 24),

                // Chiqish
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.danger.withValues(alpha: 0.2)),
                  ),
                  child: ListTile(
                    onTap: () => _showLogoutDialog(context, ref),
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: AppTheme.danger.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                      child: const Icon(Icons.logout_rounded, color: AppTheme.danger, size: 20),
                    ),
                    title: const Text('Chiqish', style: TextStyle(color: AppTheme.danger, fontWeight: FontWeight.w600)),
                    subtitle: const Text('Tizimdan chiqish', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                    trailing: const Icon(Icons.chevron_right_rounded, color: AppTheme.danger),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  ),
                ),
                const SizedBox(height: 40),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Chiqish'),
        content: const Text('Tizimdan chiqishni xohlaysizmi?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Bekor')),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(authProvider.notifier).logout();
            },
            style: FilledButton.styleFrom(backgroundColor: AppTheme.danger),
            child: const Text('Chiqish'),
          ),
        ],
      ),
    );
  }

  void _showEditProfileDialog(BuildContext context, dynamic user, WidgetRef ref) {
    final nameCtrl = TextEditingController(text: user.fullName);
    final emailCtrl = TextEditingController(text: user.email);
    final phoneCtrl = TextEditingController(text: user.phone);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppTheme.textMuted.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 20),
            const Text('✏️ Shaxsiy ma\'lumotlarni tahrirlash', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 20),
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'F.I.O.', prefixIcon: Icon(Icons.person_outline))),
            const SizedBox(height: 14),
            TextField(controller: emailCtrl, decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email_outlined))),
            const SizedBox(height: 14),
            TextField(controller: phoneCtrl, decoration: const InputDecoration(labelText: 'Telefon', prefixIcon: Icon(Icons.phone_outlined))),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () async {
                  try {
                    await ApiClient().dio.put('/profile', data: {
                      'fullName': nameCtrl.text,
                      'email': emailCtrl.text,
                      'phone': phoneCtrl.text,
                    });
                    if (ctx.mounted) {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('✅ Ma\'lumotlar saqlandi'), backgroundColor: AppTheme.success));
                      ref.read(authProvider.notifier).loadProfile();
                    }
                  } catch (e) {
                    if (ctx.mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Xato: $e'), backgroundColor: AppTheme.danger));
                  }
                },
                style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                child: const Text('Saqlash', style: TextStyle(fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showChangePasswordDialog(BuildContext context) {
    final currentCtrl = TextEditingController();
    final newCtrl = TextEditingController();
    final confirmCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppTheme.textMuted.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 20),
            const Text('🔒 Parolni o\'zgartirish', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 20),
            TextField(controller: currentCtrl, obscureText: true, decoration: const InputDecoration(labelText: 'Joriy parol', prefixIcon: Icon(Icons.lock_outline))),
            const SizedBox(height: 14),
            TextField(controller: newCtrl, obscureText: true, decoration: const InputDecoration(labelText: 'Yangi parol', prefixIcon: Icon(Icons.lock_rounded))),
            const SizedBox(height: 14),
            TextField(controller: confirmCtrl, obscureText: true, decoration: const InputDecoration(labelText: 'Parolni tasdiqlang', prefixIcon: Icon(Icons.lock_rounded))),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () async {
                  if (newCtrl.text != confirmCtrl.text) {
                    ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Parollar mos kelmadi'), backgroundColor: AppTheme.danger));
                    return;
                  }
                  try {
                    await ApiClient().dio.put('/profile/change-password', data: {
                      'currentPassword': currentCtrl.text,
                      'newPassword': newCtrl.text,
                    });
                    if (ctx.mounted) {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('✅ Parol o\'zgartirildi'), backgroundColor: AppTheme.success));
                    }
                  } catch (e) {
                    if (ctx.mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Xato: $e'), backgroundColor: AppTheme.danger));
                  }
                },
                style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                child: const Text('Saqlash', style: TextStyle(fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel({required this.text});
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.only(bottom: 10, top: 4), child: Text(text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.textMuted, letterSpacing: 0.5)));
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;
  const _InfoTile({required this.icon, required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.border)),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, size: 18, color: color),
          ),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
            const SizedBox(height: 2),
            Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
          ])),
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;
  const _ActionCard({required this.icon, required this.label, required this.subtitle, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [color.withValues(alpha: 0.15), color.withValues(alpha: 0.05)]),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        title: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
        trailing: Icon(Icons.chevron_right_rounded, color: color.withValues(alpha: 0.5)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        tileColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String trailing;
  final VoidCallback? onTap;
  const _SettingsTile({required this.icon, required this.label, required this.trailing, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      child: ListTile(
        onTap: onTap,
        leading: Icon(icon, color: AppTheme.textSecondary, size: 20),
        title: Text(label, style: const TextStyle(fontSize: 14)),
        trailing: Row(mainAxisSize: MainAxisSize.min, children: [
          Text(trailing, style: const TextStyle(fontSize: 13, color: AppTheme.textMuted)),
          const SizedBox(width: 4),
          const Icon(Icons.chevron_right_rounded, color: AppTheme.textMuted, size: 18),
        ]),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        tileColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
      ),
    );
  }
}
