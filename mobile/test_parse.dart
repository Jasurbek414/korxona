import 'dart:convert';
import 'lib/data/models.dart';

void main() {
  final jsonStr = '''{
    "id": 22,
    "inventoryNumber": "INV-001",
    "name": "HP ProBook 450 G10",
    "purchasePrice": 12000000.0,
    "commissionedDate": [2026,5,20]
  }''';
  
  try {
    final eq = Equipment.fromJson(jsonDecode(jsonStr));
    print('Success: \${eq.name}, date: \${eq.commissionedDate}');
  } catch (e, stack) {
    print('Error: \$e\\n\$stack');
  }
}
