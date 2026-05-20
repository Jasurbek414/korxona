import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/providers.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscure = true;
  bool _loading = false;

  @override
  void dispose() {
    _usernameCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    final username = _usernameCtrl.text.trim();
    final password = _passwordCtrl.text.trim();
    if (username.isEmpty || password.isEmpty) {
      _snack('Username va parolni kiriting', isError: true);
      return;
    }
    setState(() => _loading = true);
    try {
      await ref.read(authProvider.notifier).login(username, password);
    } catch (e) {
      if (mounted) {
        final msg = e.toString().contains('timeout')
            ? 'Server bilan aloqa yo\'q'
            : 'Login yoki parol noto\'g\'ri';
        _snack(msg, isError: true);
      }
    }
    if (mounted) setState(() => _loading = false);
  }

  void _snack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg, style: const TextStyle(fontWeight: FontWeight.w600)),
      backgroundColor: isError ? const Color(0xFFEF4444) : const Color(0xFF10B981),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.all(16),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Logo
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF3B82F6), Color(0xFF6366F1)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF3B82F6).withValues(alpha: 0.3),
                        blurRadius: 24,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.precision_manufacturing_rounded, color: Colors.white, size: 36),
                ),
                const SizedBox(height: 20),

                // Title
                const Text(
                  'BOSHLIQ',
                  style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w800, letterSpacing: 3),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Uskunalar boshqaruv tizimi',
                  style: TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 40),

                // Form card
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Tizimga kirish',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Hisobingiz bilan kiring',
                        style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
                      ),
                      const SizedBox(height: 24),

                      // Username
                      const Text('Login', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      _field(
                        controller: _usernameCtrl,
                        hint: 'admin',
                        icon: Icons.person_outline_rounded,
                        action: TextInputAction.next,
                      ),
                      const SizedBox(height: 18),

                      // Password
                      const Text('Parol', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      _field(
                        controller: _passwordCtrl,
                        hint: '••••••••',
                        icon: Icons.lock_outline_rounded,
                        obscure: _obscure,
                        suffix: GestureDetector(
                          onTap: () => setState(() => _obscure = !_obscure),
                          child: Icon(
                            _obscure ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                            color: const Color(0xFF475569),
                            size: 20,
                          ),
                        ),
                        onSubmit: (_) => _login(),
                      ),
                      const SizedBox(height: 28),

                      // Login button
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: ElevatedButton(
                          onPressed: _loading ? null : _login,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF3B82F6),
                            disabledBackgroundColor: const Color(0xFF3B82F6).withValues(alpha: 0.5),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 0,
                          ),
                          child: _loading
                              ? const SizedBox(
                                  width: 22, height: 22,
                                  child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                                )
                              : const Text(
                                  'Kirish',
                                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, letterSpacing: 0.5),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                // Footer
                const Text(
                  '© 2026 Boshliq v1.0',
                  style: TextStyle(color: Color(0xFF475569), fontSize: 11),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _field({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool obscure = false,
    Widget? suffix,
    TextInputAction action = TextInputAction.done,
    ValueChanged<String>? onSubmit,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      textInputAction: action,
      onSubmitted: onSubmit,
      style: const TextStyle(color: Colors.white, fontSize: 14),
      cursorColor: const Color(0xFF3B82F6),
      decoration: InputDecoration(
        prefixIcon: Icon(icon, color: const Color(0xFF475569), size: 20),
        suffixIcon: suffix != null ? Padding(padding: const EdgeInsets.only(right: 8), child: suffix) : null,
        hintText: hint,
        hintStyle: const TextStyle(color: Color(0xFF334155), fontSize: 14),
        filled: true,
        fillColor: const Color(0xFF0F172A),
        contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF334155)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF334155)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF3B82F6), width: 1.5),
        ),
      ),
    );
  }
}
