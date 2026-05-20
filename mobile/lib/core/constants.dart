class AppConstants {
  AppConstants._();

  // API (adb reverse tcp:8080 tcp:8080 orqali ishlaydi)
  static const String baseUrl = 'http://localhost:8080/api/v1';
  // static const String baseUrl = 'http://10.0.2.2:8080/api/v1'; // Android emulator
  // static const String baseUrl = 'http://192.168.23.175:8080/api/v1'; // Wi-Fi
  // static const String baseUrl = 'https://your-domain.com/api/v1'; // Production

  // Storage keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String languageKey = 'app_language';

  // Pagination
  static const int pageSize = 20;

  // File upload
  static const int maxFileSize = 10 * 1024 * 1024; // 10MB
}
