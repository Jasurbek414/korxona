import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api_client.dart';
import 'models.dart';

// ===== API Client =====
final apiProvider = Provider((_) => ApiClient());

// ===== Auth State =====
@immutable
class AuthState {
  final User? user;
  final bool loading;
  final String? error;

  const AuthState({this.user, this.loading = false, this.error});

  AuthState copyWith({User? user, bool? loading, String? error, bool clearUser = false}) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      loading: loading ?? this.loading,
      error: error,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    _checkAuth();
    return const AuthState(loading: true);
  }

  ApiClient get _api => ref.read(apiProvider);

  Future<void> _checkAuth() async {
    final hasToken = await _api.hasToken();
    if (hasToken) {
      await loadProfile();
    } else {
      state = const AuthState();
    }
  }

  Future<void> loadProfile() async {
    try {
      final res = await _api.dio.get('/profile');
      state = AuthState(user: User.fromJson(res.data));
    } catch (_) {
      await _api.logout();
      state = const AuthState();
    }
  }

  Future<void> login(String username, String password) async {
    state = const AuthState(loading: true);
    try {
      final res = await _api.dio.post('/auth/login', data: {
        'username': username,
        'password': password,
      });
      await _api.saveTokens(res.data['accessToken'], res.data['refreshToken']);
      // Login javobida id kelmaydi, profile endpoint dan to'liq ma'lumot olamiz
      await loadProfile();
    } catch (e) {
      state = AuthState(error: e.toString());
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      await _api.dio.post('/auth/logout');
    } catch (_) {}
    await _api.logout();
    state = const AuthState();
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);

// ===== Dashboard KPI =====
final dashboardKpiProvider = FutureProvider<DashboardKpi>((ref) async {
  final api = ref.read(apiProvider);
  final res = await api.dio.get('/reports/dashboard');
  return DashboardKpi.fromJson(res.data);
});

// ===== Equipment =====
final equipmentListProvider = FutureProvider.family<List<Equipment>, Map<String, dynamic>>((ref, params) async {
  final api = ref.read(apiProvider);
  try {
    final res = await api.dio.get('/equipment', queryParameters: params);
    final data = res.data;
    final content = data is Map ? (data['content'] as List?) ?? [] : data as List;
    return content.map((e) => Equipment.fromJson(e)).toList();
  } catch (e) {
    throw Exception('Uskunalar yuklanmadi: $e');
  }
});

final equipmentDetailProvider = FutureProvider.family<Equipment, int>((ref, id) async {
  final api = ref.read(apiProvider);
  try {
    final res = await api.dio.get('/equipment/$id');
    return Equipment.fromJson(res.data);
  } catch (e) {
    throw Exception('Uskuna ma\'lumotlari yuklanmadi: $e');
  }
});

final statusHistoryProvider = FutureProvider.family<List<StatusHistory>, int>((ref, equipmentId) async {
  final api = ref.read(apiProvider);
  final res = await api.dio.get('/equipment/$equipmentId/status-history');
  return (res.data as List).map((e) => StatusHistory.fromJson(e)).toList();
});

// ===== PPR Tasks =====
final pprTasksProvider = FutureProvider.family<List<PprTask>, Map<String, dynamic>>((ref, params) async {
  final api = ref.read(apiProvider);
  final res = await api.dio.get('/ppr/tasks', queryParameters: params);
  final data = res.data;
  final content = data is Map ? (data['content'] as List?) ?? [] : data as List;
  return content.map((e) => PprTask.fromJson(e)).toList();
});

final pprTaskDetailProvider = FutureProvider.family<PprTask, int>((ref, id) async {
  final api = ref.read(apiProvider);
  final res = await api.dio.get('/ppr/tasks/$id');
  return PprTask.fromJson(res.data);
});

final checklistProvider = FutureProvider.family<List<ChecklistItem>, int>((ref, taskId) async {
  final api = ref.read(apiProvider);
  final res = await api.dio.get('/ppr/tasks/$taskId/checklist');
  return (res.data as List).map((e) => ChecklistItem.fromJson(e)).toList();
});

final taskPhotosProvider = FutureProvider.family<List<TaskPhoto>, int>((ref, taskId) async {
  final api = ref.read(apiProvider);
  final res = await api.dio.get('/ppr/tasks/$taskId/photos');
  return (res.data as List).map((e) => TaskPhoto.fromJson(e)).toList();
});

final timeEntriesProvider = FutureProvider.family<List<TimeEntry>, int>((ref, taskId) async {
  final api = ref.read(apiProvider);
  final res = await api.dio.get('/ppr/tasks/$taskId/time-entries');
  return (res.data as List).map((e) => TimeEntry.fromJson(e)).toList();
});

final totalTimeProvider = FutureProvider.family<int, int>((ref, taskId) async {
  final api = ref.read(apiProvider);
  final res = await api.dio.get('/ppr/tasks/$taskId/total-time');
  return res.data['totalMinutes'] ?? 0;
});

// ===== User Requests =====
final userRequestsProvider = FutureProvider.family<List<UserRequest>, bool>((ref, isAdmin) async {
  final api = ref.read(apiProvider);
  final endpoint = isAdmin ? '/requests' : '/requests/my';
  final res = await api.dio.get(endpoint);
  final data = res.data;
  final content = data is Map ? (data['content'] as List?) ?? [] : data as List;
  return content.map((e) => UserRequest.fromJson(e)).toList();
});

// ===== Notifications =====
final notificationsProvider = FutureProvider<List<AppNotification>>((ref) async {
  final api = ref.read(apiProvider);
  try {
    final res = await api.dio.get('/notifications');
    final data = res.data;
    final List content = data is Map ? (data['content'] as List?) ?? [] : data is List ? data : [];
    return content.map((e) => AppNotification.fromJson(e)).toList();
  } catch (_) {
    // Agar notifications endpoint hali backend da tayyor bo'lmasa, bo'sh qaytaramiz
    return [];
  }
});

final unreadNotificationCountProvider = FutureProvider<int>((ref) async {
  final api = ref.read(apiProvider);
  try {
    final res = await api.dio.get('/notifications/unread-count');
    return res.data['count'] ?? res.data['unreadCount'] ?? 0;
  } catch (_) {
    return 0;
  }
});
