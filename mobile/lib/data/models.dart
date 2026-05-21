class User {
  final int id;
  final String username;
  final String fullName;
  final String role;
  final String? email;
  final String? phone;
  final bool isActive;
  final String? language;

  User({
    required this.id,
    required this.username,
    required this.fullName,
    required this.role,
    this.email,
    this.phone,
    this.isActive = true,
    this.language,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] ?? 0,
        username: json['username'] ?? '',
        fullName: json['fullName'] ?? '',
        role: json['role'] ?? 'VIEWER',
        email: json['email'],
        phone: json['phone'],
        isActive: json['isActive'] ?? true,
        language: json['language'],
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
  final String? qrCodePath;
  final int? categoryId;
  final int? statusId;
  final int? locationId;
  final int? responsiblePersonId;
  final int? manufacturerId;
  final int? modelId;

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
    this.qrCodePath,
    this.categoryId,
    this.statusId,
    this.locationId,
    this.responsiblePersonId,
    this.manufacturerId,
    this.modelId,
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
        serialNumber: json['serialNumber']?.toString(),
        commissionedDate: _parseDate(json['commissionedDate']),
        warrantyDate: _parseDate(json['warrantyDate']),
        purchasePrice: (json['purchasePrice'] as num?)?.toDouble(),
        notes: json['notes'],
        qrCodePath: json['qrCodePath'],
        categoryId: json['categoryId'],
        statusId: json['statusId'],
        locationId: json['locationId'],
        responsiblePersonId: json['responsiblePersonId'],
        manufacturerId: json['manufacturerId'],
        modelId: json['modelId'],
      );
}

class PprTask {
  final int id;
  final String? taskNumber;
  final String? equipmentName;
  final int? equipmentId;
  final String? pprTypeName;
  final String? assignedToName;
  final int? assignedToId;
  final String? scheduledDate;
  final String? completedDate;
  final String status;
  final String priority;
  final String? description;
  final String? completionNotes;
  final String? createdAt;
  final int? timeSpentMinutes;
  final int? overdueDays;
  final bool? isOverdueFlag;

  PprTask({
    required this.id,
    this.taskNumber,
    this.equipmentName,
    this.equipmentId,
    this.pprTypeName,
    this.assignedToName,
    this.assignedToId,
    this.scheduledDate,
    this.completedDate,
    required this.status,
    required this.priority,
    this.description,
    this.completionNotes,
    this.createdAt,
    this.timeSpentMinutes,
    this.overdueDays,
    this.isOverdueFlag,
  });

  factory PprTask.fromJson(Map<String, dynamic> json) => PprTask(
        id: json['id'] ?? 0,
        taskNumber: json['taskNumber'],
        equipmentName: json['equipmentName'],
        equipmentId: json['equipmentId'],
        pprTypeName: json['pprTypeName'],
        assignedToName: json['assignedToName'],
        assignedToId: json['assignedToId'],
        scheduledDate: _parseDate(json['scheduledDate']),
        completedDate: _parseDate(json['completedDate']),
        status: json['status'] ?? 'SCHEDULED',
        priority: json['priority'] ?? 'NORMAL',
        description: json['description'],
        completionNotes: json['completionNotes'],
        createdAt: _parseDate(json['createdAt']),
        timeSpentMinutes: json['timeSpentMinutes'],
        overdueDays: json['overdueDays'],
        isOverdueFlag: json['isOverdue'],
      );

  bool get isOverdue {
    if (isOverdueFlag == true) return true;
    if (scheduledDate == null) return false;
    if (status == 'COMPLETED' || status == 'APPROVED') return false;
    return DateTime.tryParse(scheduledDate!)?.isBefore(DateTime.now()) ?? false;
  }

  String get statusLabel => switch (status) {
        'SCHEDULED' => 'Rejalashtirilgan',
        'IN_PROGRESS' => 'Jarayonda',
        'COMPLETED' => 'Bajarildi',
        'APPROVED' => 'Tasdiqlandi',
        _ => status,
      };

  String get priorityLabel => switch (priority) {
        'LOW' => 'Past',
        'NORMAL' => "O'rta",
        'HIGH' => 'Yuqori',
        'CRITICAL' => 'Kritik',
        _ => priority,
      };
}

class ChecklistItem {
  final int id;
  final String description;
  final bool completed;
  final String? notes;

  ChecklistItem({required this.id, required this.description, this.completed = false, this.notes});

  factory ChecklistItem.fromJson(Map<String, dynamic> json) => ChecklistItem(
        id: json['id'] ?? 0,
        description: json['description'] ?? json['itemText'] ?? '',
        completed: json['completed'] ?? json['checked'] ?? false,
        notes: json['notes'],
      );
}

class DashboardKpi {
  final int totalEquipment;
  final int activePpr;
  final int overdueTasks;
  final int lowStockAlerts;
  final int todayTasks;
  final int pprCompletionRate;
  final int pprCompletedTasks;

  DashboardKpi({
    this.totalEquipment = 0,
    this.activePpr = 0,
    this.overdueTasks = 0,
    this.lowStockAlerts = 0,
    this.todayTasks = 0,
    this.pprCompletionRate = 0,
    this.pprCompletedTasks = 0,
  });

  factory DashboardKpi.fromJson(Map<String, dynamic> json) => DashboardKpi(
        totalEquipment: _toInt(json['totalEquipment']),
        activePpr: _toInt(json['pprTotalTasks'] ?? json['activePpr']),
        overdueTasks: _toInt(json['overdueTasks']),
        lowStockAlerts: _toInt(json['lowStockAlerts']),
        todayTasks: _toInt(json['todayTasks']),
        pprCompletionRate: _toInt(json['pprCompletionRate']),
        pprCompletedTasks: _toInt(json['pprCompletedTasks']),
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
        respondedAt: _parseDate(json['respondedAt']),
        createdAt: _parseDate(json['createdAt']),
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

class TaskPhoto {
  final int id;
  final String? filePath;
  final String? photoType; // BEFORE / AFTER
  final String? createdAt;

  TaskPhoto({required this.id, this.filePath, this.photoType, this.createdAt});

  factory TaskPhoto.fromJson(Map<String, dynamic> json) => TaskPhoto(
        id: json['id'] ?? 0,
        filePath: json['filePath'],
        photoType: json['photoType'],
        createdAt: _parseDate(json['createdAt']),
      );
}

class TimeEntry {
  final int id;
  final int? durationMinutes;
  final String? description;
  final String? userName;
  final String? createdAt;

  TimeEntry({required this.id, this.durationMinutes, this.description, this.userName, this.createdAt});

  factory TimeEntry.fromJson(Map<String, dynamic> json) => TimeEntry(
        id: json['id'] ?? 0,
        durationMinutes: json['durationMinutes'],
        description: json['description'],
        userName: json['userName'] ?? json['userFullName'],
        createdAt: _parseDate(json['createdAt']),
      );
}

class AppNotification {
  final int id;
  final String title;
  final String? message;
  final String? type;
  final bool isRead;
  final String? createdAt;
  final Map<String, dynamic>? data;

  AppNotification({
    required this.id,
    required this.title,
    this.message,
    this.type,
    this.isRead = false,
    this.createdAt,
    this.data,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) => AppNotification(
        id: json['id'] ?? 0,
        title: json['title'] ?? '',
        message: json['message'] ?? json['body'],
        type: json['type'],
        isRead: json['isRead'] ?? json['read'] ?? false,
        createdAt: _parseDate(json['createdAt']),
        data: json['data'] is Map ? Map<String, dynamic>.from(json['data']) : null,
      );
}

class StatusHistory {
  final int id;
  final String? oldStatusName;
  final String? oldStatusColor;
  final String? newStatusName;
  final String? newStatusColor;
  final String? changedByName;
  final String? reason;
  final String? createdAt;

  StatusHistory({
    required this.id,
    this.oldStatusName,
    this.oldStatusColor,
    this.newStatusName,
    this.newStatusColor,
    this.changedByName,
    this.reason,
    this.createdAt,
  });

  factory StatusHistory.fromJson(Map<String, dynamic> json) => StatusHistory(
        id: json['id'] ?? 0,
        oldStatusName: json['oldStatusName'],
        oldStatusColor: json['oldStatusColor'],
        newStatusName: json['newStatusName'],
        newStatusColor: json['newStatusColor'],
        changedByName: json['changedByName'],
        reason: json['reason'],
        createdAt: _parseDate(json['createdAt']),
      );
}

// ===== Helper funksiyalar =====

String? _parseDate(dynamic dateData) {
  if (dateData == null) return null;
  if (dateData is String) return dateData;
  if (dateData is List && dateData.length >= 3) {
    // Jackson LocalDate format: [year, month, day]
    final year = dateData[0].toString();
    final month = dateData[1].toString().padLeft(2, '0');
    final day = dateData[2].toString().padLeft(2, '0');
    if (dateData.length >= 6) {
      final hour = dateData[3].toString().padLeft(2, '0');
      final minute = dateData[4].toString().padLeft(2, '0');
      final second = dateData[5].toString().padLeft(2, '0');
      return '$year-$month-${day}T$hour:$minute:$second';
    }
    return '$year-$month-$day';
  }
  return dateData.toString();
}

int _toInt(dynamic value) {
  if (value == null) return 0;
  if (value is int) return value;
  if (value is double) return value.toInt();
  if (value is String) return int.tryParse(value) ?? 0;
  return 0;
}
