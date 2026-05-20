class AppConstants {
  AppConstants._();

  // Cloudflare Tunnel orqali
  static const String baseUrl = 'https://boshliq-api.ecos.uz/api/v1';
  // static const String baseUrl = 'http://localhost:8080/api/v1'; // Local USB
  // static const String baseUrl = 'http://10.0.2.2:8080/api/v1'; // Android emulator
  // static const String baseUrl = 'http://192.168.23.175:8080/api/v1'; // Wi-Fi

  // Storage keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String languageKey = 'app_language';

  // Pagination
  static const int pageSize = 20;

  // File upload
  static const int maxFileSize = 10 * 1024 * 1024; // 10MB
}
