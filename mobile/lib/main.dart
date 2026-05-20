import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme.dart';
import 'data/providers.dart';
import 'screens/auth/login_screen.dart';
import 'screens/shell/main_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));

  runApp(const ProviderScope(child: EquipmentApp()));
}

class EquipmentApp extends ConsumerWidget {
  const EquipmentApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    if (authState.loading) return MaterialApp(debugShowCheckedModeBanner: false, theme: AppTheme.lightTheme, home: const SplashScreen());
    if (authState.user != null) return MaterialApp(debugShowCheckedModeBanner: false, theme: AppTheme.lightTheme, home: const MainShell());
    return MaterialApp(debugShowCheckedModeBanner: false, theme: AppTheme.lightTheme, home: const LoginScreen());
  }
}

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

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
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [BoxShadow(color: Colors.blue.withValues(alpha: 0.2), blurRadius: 30)],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Image.asset('assets/images/icon.png', fit: BoxFit.cover),
                ),
              ),
              const SizedBox(height: 24),
              const Text('BOSHLIQ', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: 3)),
              const SizedBox(height: 8),
              Text('Uskunalar boshqaruvi', style: TextStyle(color: Colors.blue.shade200.withValues(alpha: 0.6), fontSize: 14)),
              const SizedBox(height: 32),
              const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white54)),
            ],
          ),
        ),
      ),
    );
  }
}
