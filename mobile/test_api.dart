import 'package:dio/dio.dart';
import 'lib/data/models.dart';

void main() async {
  final dio = Dio();
  
  try {
    print('Attempting login with admin / Admin123!...');
    final res = await dio.post(
      'http://localhost:8080/api/v1/auth/login',
      data: {'username': 'admin', 'password': 'Admin123!'},
    );
    print('LOGIN SUCCESS!');
    print('Username: ${res.data['username']}');
    print('FullName: ${res.data['fullName']}');
    print('Role: ${res.data['role']}');
    final token = res.data['accessToken'];
    print('Token: ${token.toString().substring(0, 50)}...');
    
    // Now test equipment endpoint
    print('\nFetching equipment list...');
    final eq = await dio.get(
      'http://localhost:8080/api/v1/equipment?page=0&size=10',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    final data = eq.data;
    print('Total equipment: ${data['totalElements']}');
    final content = data['content'] as List;
    for (var item in content.take(3)) {
      print('  - ${item['name']} (${item['inventoryNumber']})');
    }
    
    // Test PPR tasks
    print('\nFetching PPR tasks...');
    final ppr = await dio.get(
      'http://localhost:8080/api/v1/ppr/tasks?page=0&size=10',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    final pprData = ppr.data;
    print('Total PPR tasks: ${pprData['totalElements']}');
    final pprContent = pprData['content'] as List;
    for (var item in pprContent.take(3)) {
      print('  - ${item['taskNumber']}: ${item['equipmentName']}');
    }
    
    // Test profile
    print('\nFetching profile...');
    final profile = await dio.get(
      'http://localhost:8080/api/v1/profile',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    print('Profile: ${profile.data['fullName']} (${profile.data['role']})');
    
    // Now test via Cloudflare tunnel
    print('\n=== Testing via Cloudflare Tunnel ===');
    final tunRes = await dio.post(
      'https://boshliq-api.ecos.uz/api/v1/auth/login',
      data: {'username': 'viewer1', 'password': 'Admin123!'},
    );
    print('Tunnel LOGIN SUCCESS! Token received.');
    final tunToken = tunRes.data['accessToken'];

    print('\nFetching equipment list from Tunnel...');
    final tunEq = await dio.get(
      'https://boshliq-api.ecos.uz/api/v1/equipment?page=0&size=100',
      options: Options(headers: {'Authorization': 'Bearer $tunToken'}),
    );
    print('Tunnel Total equipment: ${tunEq.data['totalElements']}');
    final tunContent = tunEq.data['content'] as List;
    print('Tunnel items returned: ${tunContent.length}');
    
    // Test parsing
    for (var item in tunContent) {
      try {
        final eq = Equipment.fromJson(item);
      } catch (e, stack) {
        print('PARSING ERROR ON ITEM: $item');
        print('Exception: $e');
        print('Stack: $stack');
      }
    }
    print('Parsing completed successfully.');
  } catch (e) {
    if (e is DioException) {
      print('ERROR: ${e.response?.statusCode} - ${e.response?.data}');
    } else {
      print('ERROR: $e');
    }
  }
}
