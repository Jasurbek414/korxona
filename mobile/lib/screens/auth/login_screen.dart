import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../data/providers.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> with SingleTickerProviderStateMixin {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscure = true;
  bool _loading = false;
  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _animController.forward();
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _animController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    final username = _usernameController.text.trim();
    final password = _passwordController.text.trim();
    if (username.isEmpty || password.isEmpty) {
      _showSnack('Username va parolni kiriting', isError: true);
      return;
    }
    setState(() => _loading = true);
    try {
      await ref.read(authProvider.notifier).login(username, password);
      if (mounted) _showSnack('Tizimga xush kelibsiz! 🎉');
    } catch (e) {
      if (mounted) _showSnack('Login yoki parol noto\'g\'ri', isError: true);
    }
    if (mounted) setState(() => _loading = false);
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? AppTheme.danger : AppTheme.success,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF0F172A), Color(0xFF1E3A5F), Color(0xFF0F172A)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: FadeTransition(
                opacity: _fadeAnim,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Logo
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF7C3AED)]),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [BoxShadow(color: Colors.blue.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 8))],
                      ),
                      child: const Icon(Icons.computer_rounded, color: Colors.white, size: 36),
                    ),
                    const SizedBox(height: 24),
                    const Text('Uskunalar boshqaruvi', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    Text('Tizimga kirish', style: TextStyle(color: Colors.blue.shade200.withValues(alpha: 0.6), fontSize: 14)),
                    const SizedBox(height: 40),

                    // Form
                    Container(
                      padding: const EdgeInsets.all(28),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                      ),
                      child: Column(
                        children: [
                          // Username
                          TextField(
                            controller: _usernameController,
                            style: const TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              prefixIcon: Icon(Icons.person_outline, color: Colors.blue.shade200.withValues(alpha: 0.5)),
                              hintText: 'Foydalanuvchi nomi',
                              hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.3)),
                              filled: true,
                              fillColor: Colors.white.withValues(alpha: 0.05),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1))),
                              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1))),
                              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.blue.shade400.withValues(alpha: 0.5), width: 2)),
                            ),
                            textInputAction: TextInputAction.next,
                          ),
                          const SizedBox(height: 16),

                          // Password
                          TextField(
                            controller: _passwordController,
                            obscureText: _obscure,
                            style: const TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              prefixIcon: Icon(Icons.lock_outline, color: Colors.blue.shade200.withValues(alpha: 0.5)),
                              suffixIcon: IconButton(
                                icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility, color: Colors.blue.shade200.withValues(alpha: 0.5)),
                                onPressed: () => setState(() => _obscure = !_obscure),
                              ),
                              hintText: 'Parol',
                              hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.3)),
                              filled: true,
                              fillColor: Colors.white.withValues(alpha: 0.05),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1))),
                              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1))),
                              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.blue.shade400.withValues(alpha: 0.5), width: 2)),
                            ),
                            onSubmitted: (_) => _login(),
                          ),
                          const SizedBox(height: 24),

                          // Button
                          SizedBox(
                            width: double.infinity,
                            height: 52,
                            child: ElevatedButton(
                              onPressed: _loading ? null : _login,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.transparent,
                                shadowColor: Colors.transparent,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                padding: EdgeInsets.zero,
                              ),
                              child: Ink(
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(colors: [Color(0xFF2563EB), Color(0xFF7C3AED)]),
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: Center(
                                  child: _loading
                                      ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                                      : const Text('Tizimga kirish', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                    Text('© 2026 Uskunalar boshqaruv tizimi', style: TextStyle(color: Colors.blue.shade200.withValues(alpha: 0.3), fontSize: 12)),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
