import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../data/providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    if (user == null) return const SizedBox.shrink();

    final initials = user.fullName.split(' ').map((w) => w.isNotEmpty ? w[0] : '').join().toUpperCase();

    return Scaffold(
      appBar: AppBar(title: const Text('Profil')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Avatar card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.border),
            ),
            child: Column(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF6366F1)]),
                    borderRadius: BorderRadius.circular(22),
                    boxShadow: [BoxShadow(color: AppTheme.primary.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6))],
                  ),
                  child: Center(child: Text(initials, style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700))),
                ),
                const SizedBox(height: 16),
                Text(user.fullName, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text('@${user.username}', style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: user.isAdmin ? AppTheme.danger.withValues(alpha: 0.1) : AppTheme.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    user.isAdmin ? '👑 Administrator' : user.role,
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: user.isAdmin ? AppTheme.danger : AppTheme.primary),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Ma'lumotlar
          _InfoTile(icon: Icons.email_outlined, label: 'Email', value: user.email ?? '—'),
          _InfoTile(icon: Icons.phone_outlined, label: 'Telefon', value: user.phone ?? '—'),
          const SizedBox(height: 16),

          // Sozlamalar
          _ActionTile(icon: Icons.language_rounded, label: 'Til: O\'zbekcha', onTap: () {}),
          _ActionTile(icon: Icons.lock_outline_rounded, label: 'Parolni o\'zgartirish', onTap: () {}),
          _ActionTile(icon: Icons.info_outline_rounded, label: 'Ilova haqida', onTap: () {
            showAboutDialog(context: context, applicationName: 'Uskunalar Boshqaruvi', applicationVersion: '1.0.0');
          }),
          const SizedBox(height: 24),

          // Chiqish
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => ref.read(authProvider.notifier).logout(),
              icon: const Icon(Icons.logout_rounded, color: AppTheme.danger),
              label: const Text('Chiqish', style: TextStyle(color: AppTheme.danger)),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: BorderSide(color: AppTheme.danger.withValues(alpha: 0.3)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoTile({required this.icon, required this.label, required this.value});

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
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
              Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _ActionTile({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      child: ListTile(
        onTap: onTap,
        leading: Icon(icon, color: AppTheme.textSecondary, size: 22),
        title: Text(label, style: const TextStyle(fontSize: 14)),
        trailing: const Icon(Icons.chevron_right_rounded, color: AppTheme.textMuted),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        tileColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
      ),
    );
  }
}
