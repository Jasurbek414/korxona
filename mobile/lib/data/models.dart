class User {
  final int id;
  final String username;
  final String fullName;
  final String role;
  final String? email;
  final String? phone;
  final bool isActive;

  User({
    required this.id,
    required this.username,
    required this.fullName,
    required this.role,
    this.email,
    this.phone,
    this.isActive = true,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] ?? 0,
        username: json['username'] ?? '',
        fullName: json['fullName'] ?? '',
        role: json['role'] ?? 'VIEWER',
        email: json['email'],
        phone: json['phone'],
        isActive: json['isActive'] ?? true,
      );

  /// Login javobidan yaratish (id kelmaydi, profile dan olinadi)
  factory User.fromAuthResponse(Map<String, dynamic> json) => User(
        id: 0,
        username: json['username'] ?? '',
        fullName: json['fullName'] ?? '',
        role: json['role'] ?? 'VIEWER',
      );

  bool get isAdmin => role == 'ADMIN';
  bool get isOperator => role == 'OPERATOR' || isAdmin;
}

class Equipment {
  final int id;
  final String inventoryNumber;
  final String name;
  final String? categoryName;
  final String? statusName;
  final String? statusColor;
  final String? locationName;
  final String? responsiblePersonName;
  final String? manufacturerName;
  final String? modelName;
  final String? serialNumber;
  final String? commissionedDate;
  final String? warrantyDate;
  final double? purchasePrice;
  final String? notes;

  Equipment({
    required this.id,
    required this.inventoryNumber,
    required this.name,
    this.categoryName,
    this.statusName,
    this.statusColor,
    this.locationName,
    this.responsiblePersonName,
    this.manufacturerName,
    this.modelName,
    this.serialNumber,
    this.commissionedDate,
    this.warrantyDate,
    this.purchasePrice,
    this.notes,
  });

  factory Equipment.fromJson(Map<String, dynamic> json) => Equipment(
        id: json['id'] ?? 0,
        inventoryNumber: json['inventoryNumber'] ?? '',
        name: json['name'] ?? '',
        categoryName: json['categoryName'],
        statusName: json['statusName'],
        statusColor: json['statusColor'],
        locationName: json['locationName'],
        responsiblePersonName: json['responsiblePersonName'],
        manufacturerName: json['manufacturerName'],
        modelName: json['modelName'],
        serialNumber: json['serialNumber'],
        commissionedDate: json['commissionedDate'],
        warrantyDate: json['warrantyDate'],
        purchasePrice: (json['purchasePrice'] as num?)?.toDouble(),
        notes: json['notes'],
      );
}

class PprTask {
  final int id;
  final String? taskNumber;
  final String? equipmentName;
  final int? equipmentId;
  final String? pprTypeName;
  final String? assignedToName;
  final String? scheduledDate;
  final String status;
  final String priority;
  final String? completionNotes;
  final String? createdAt;

  PprTask({
    required this.id,
    this.taskNumber,
    this.equipmentName,
    this.equipmentId,
    this.pprTypeName,
    this.assignedToName,
    this.scheduledDate,
    required this.status,
    required this.priority,
    this.completionNotes,
    this.createdAt,
  });

  factory PprTask.fromJson(Map<String, dynamic> json) => PprTask(
        id: json['id'] ?? 0,
        taskNumber: json['taskNumber'],
        equipmentName: json['equipmentName'],
        equipmentId: json['equipmentId'],
        pprTypeName: json['pprTypeName'],
        assignedToName: json['assignedToName'],
        scheduledDate: json['scheduledDate'],
        status: json['status'] ?? 'SCHEDULED',
        priority: json['priority'] ?? 'NORMAL',
        completionNotes: json['completionNotes'],
        createdAt: json['createdAt'],
      );

  bool get isOverdue {
    if (scheduledDate == null) return false;
    if (status == 'COMPLETED' || status == 'APPROVED') return false;
    return DateTime.tryParse(scheduledDate!)?.isBefore(DateTime.now()) ?? false;
  }
}

class ChecklistItem {
  final int id;
  final String description;
  final bool completed;
  final String? notes;

  ChecklistItem({required this.id, required this.description, this.completed = false, this.notes});

  factory ChecklistItem.fromJson(Map<String, dynamic> json) => ChecklistItem(
        id: json['id'] ?? 0,
        description: json['description'] ?? '',
        completed: json['completed'] ?? false,
        notes: json['notes'],
      );
}

class DashboardKpi {
  final int totalEquipment;
  final int activePpr;
  final int overdueTasks;
  final int lowStockAlerts;

  DashboardKpi({
    this.totalEquipment = 0,
    this.activePpr = 0,
    this.overdueTasks = 0,
    this.lowStockAlerts = 0,
  });

  factory DashboardKpi.fromJson(Map<String, dynamic> json) => DashboardKpi(
        totalEquipment: json['totalEquipment'] ?? 0,
        activePpr: json['activePpr'] ?? 0,
        overdueTasks: json['overdueTasks'] ?? 0,
        lowStockAlerts: json['lowStockAlerts'] ?? 0,
      );
}

/// Backend UserRequestDto ga mos model
class UserRequest {
  final int id;
  final String? requestNumber;
  final int? equipmentId;
  final String? equipmentName;
  final int? requestedById;
  final String? requestedByName;
  final String requestType;
  final String status;
  final String? description;
  final String? responseNotes;
  final String? respondedByName;
  final String? respondedAt;
  final String? createdAt;

  UserRequest({
    required this.id,
    this.requestNumber,
    this.equipmentId,
    this.equipmentName,
    this.requestedById,
    this.requestedByName,
    required this.requestType,
    required this.status,
    this.description,
    this.responseNotes,
    this.respondedByName,
    this.respondedAt,
    this.createdAt,
  });

  factory UserRequest.fromJson(Map<String, dynamic> json) => UserRequest(
        id: json['id'] ?? 0,
        requestNumber: json['requestNumber'],
        equipmentId: json['equipmentId'],
        equipmentName: json['equipmentName'],
        requestedById: json['requestedById'],
        requestedByName: json['requestedByName'],
        requestType: json['requestType'] ?? 'OTHER',
        status: json['status'] ?? 'NEW',
        description: json['description'],
        responseNotes: json['responseNotes'],
        respondedByName: json['respondedByName'],
        respondedAt: json['respondedAt'],
        createdAt: json['createdAt'],
      );

  String get typeLabel => switch (requestType) {
        'REPAIR' => "Ta'mirlash",
        'REPLACE' => 'Almashtirish',
        'OTHER' => 'Boshqa',
        _ => requestType,
      };

  String get statusLabel => switch (status) {
        'NEW' => 'Yangi',
        'REVIEWING' => "Ko'rilmoqda",
        'APPROVED' => 'Tasdiqlangan',
        'REJECTED' => 'Rad etilgan',
        'COMPLETED' => 'Bajarildi',
        _ => status,
      };
}
