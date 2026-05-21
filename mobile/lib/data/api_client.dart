import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/constants.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio dio;
  final _storage = const FlutterSecureStorage();
  void Function()? onUnauthenticated;

  ApiClient._internal() {
    dio = Dio(BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));

    // JWT token interceptor
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        try {
          final token = await _storage.read(key: AppConstants.accessTokenKey).timeout(const Duration(seconds: 3));
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
        } catch (_) {}
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401 &&
            error.requestOptions.headers['_retried'] != true) {
          final refreshed = await _refreshToken();
          if (refreshed) {
            // Qayta urinish (1 marta)
            final token = await _storage.read(key: AppConstants.accessTokenKey);
            error.requestOptions.headers['Authorization'] = 'Bearer $token';
            error.requestOptions.headers['_retried'] = true;
            try {
              final response = await dio.fetch(error.requestOptions);
              return handler.resolve(response);
            } catch (_) {
              await logout();
              return handler.next(error);
            }
          } else {
            await logout();
          }
        }
        return handler.next(error);
      },
    ));
  }

  Future<bool> _refreshToken() async {
    try {
      String? refreshToken;
      try {
        refreshToken = await _storage.read(key: AppConstants.refreshTokenKey).timeout(const Duration(seconds: 3));
      } catch (_) {
        return false;
      }
      
      if (refreshToken == null) return false;

      final response = await Dio(BaseOptions(
        baseUrl: AppConstants.baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
      )).post('/auth/refresh', data: {'refreshToken': refreshToken});

      final data = response.data;
      await _storage.write(key: AppConstants.accessTokenKey, value: data['accessToken']);
      await _storage.write(key: AppConstants.refreshTokenKey, value: data['refreshToken']);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> saveTokens(String accessToken, String refreshToken) async {
    try {
      await _storage.write(key: AppConstants.accessTokenKey, value: accessToken).timeout(const Duration(seconds: 3));
      await _storage.write(key: AppConstants.refreshTokenKey, value: refreshToken).timeout(const Duration(seconds: 3));
    } catch (_) {}
  }

  Future<void> logout() async {
    try {
      await _storage.deleteAll().timeout(const Duration(seconds: 3));
    } catch (_) {}
    if (onUnauthenticated != null) onUnauthenticated!();
  }

  Future<bool> hasToken() async {
    try {
      final token = await _storage.read(key: AppConstants.accessTokenKey).timeout(const Duration(seconds: 3));
      return token != null;
    } catch (_) {
      return false;
    }
  }
}
