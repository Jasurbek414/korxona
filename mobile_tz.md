# TEXNIK TOPSHIRIQ — MOBIL ILOVA

## Uskunalar Boshqaruv Tizimi — Flutter Mobile Application

**Hujjat versiyasi:** 1.0  
**Sana:** 2026-05-20  
**Platforma:** Android / iOS (Cross-platform)  
**Texnologiya:** Flutter 3.x + Dart 3.x  
**Backend API:** Spring Boot 3 — `{BASE_URL}/api/v1/*`

---

## 1. UMUMIY MA'LUMOT

### 1.1 Maqsad

Mavjud web-tizimdagi ma'lumotlar bilan to'liq sinxronizatsiyada ishlovchi mobil ilova yaratish. Ilova orqali operatorlar va texnik xodimlar QR-kodni skanerlash, PPR vazifalarni bajarish, chek-listlarni to'ldirish, foto yuklash va arizalar yuborish imkoniyatiga ega bo'ladilar.

### 1.2 Foydalanuvchi rollari

| Rol | Mobilda ruxsat etilgan funksiyalar |
|-----|----------------------------------|
| **Administrator** | Barcha funksiyalar + statistika |
| **Operator** | QR skanerlash, PPR bajarish, chek-list, foto, ariza |
| **Ko'ruvchi** | Faqat ma'lumotlarni ko'rish |

### 1.3 Til qo'llab-quvvatlashi

- O'zbek tili (standart)
- Rus tili
- Til tanlash Login sahifasida va Profil sozlamalarida

### 1.4 Texnologiya steki

| Texnologiya | Versiya | Vazifasi |
|------------|---------|----------|
| **Flutter** | 3.x | Cross-platform UI framework |
| **Dart** | 3.x | Dasturlash tili |
| **Dio** | 5.x | HTTP so'rovlar (REST API) |
| **mobile_scanner** | latest | QR-kod va shtrix-kod skanerlash |
| **image_picker** | latest | Kameradan foto olish |
| **flutter_secure_storage** | latest | JWT tokenlarni xavfsiz saqlash |
| **riverpod** | 2.x | State management |
| **go_router** | latest | Navigatsiya va routing |
| **cached_network_image** | latest | Rasm keshlash |
| **firebase_messaging** | latest | Push-notification |
| **flutter_local_notifications** | latest | Lokal xabarlar |
| **shimmer** | latest | Loading skeleton effektlar |
| **intl** | latest | i18n lokalizatsiya |

---

## 2. EKRANLAR VA FUNKSIYALAR

### 2.1 Avtorizatsiya ekrani

**Fayl:** `lib/screens/auth/login_screen.dart`

| Funksiya | Tavsif |
|----------|--------|
| Login/parol kiritish | Matnli maydonlar + validatsiya |
| JWT token olish | `POST /api/v1/auth/login` |
| Token saqlash | `flutter_secure_storage` da xavfsiz saqlash |
| "Meni eslab qol" | Checkbox — keyingi ochilishda avtomatik kirish |
| Biometrik kirish | Fingerprint / Face ID orqali (ixtiyoriy) |
| Til tanlash | UZ / RU tugmalari |
| Brute force himoya | 5 marta noto'g'ri → 15 daqiqa kutish |

**API endpointlar:**
```
POST   /api/v1/auth/login         → { username, password }
POST   /api/v1/auth/refresh       → { refreshToken }
GET    /api/v1/profile            → foydalanuvchi ma'lumotlari
```

---

### 2.2 Bosh sahifa (Dashboard)

**Fayl:** `lib/screens/home/home_screen.dart`

| Element | Tavsif |
|---------|--------|
| KPI kartalar | Jami uskunalar, Faol PPR, Muddati o'tgan, Kam qoldiq |
| Tezkor tugmalar | QR skanerlash, Yangi ariza, PPR ro'yxati |
| So'nggi xabarnomalar | Push-notification tarixi (oxirgi 5 ta) |
| Pull-to-refresh | Yuqoridan tortish orqali yangilash |

**API endpointlar:**
```
GET    /api/v1/reports/dashboard   → KPI ko'rsatkichlari
GET    /api/v1/notifications       → Xabarnomalar
```

---

### 2.3 QR-kod skanerlash

**Fayl:** `lib/screens/scanner/qr_scanner_screen.dart`

| Funksiya | Tavsif |
|----------|--------|
| Kamera orqali skanerlash | `mobile_scanner` paketi |
| JSON parse | `{"type":"equipment","id":123}` formatni o'qish |
| Uskuna kartochkasiga o'tish | Avtomatik navigatsiya |
| Ehtiyot qism aniqlash | `{"type":"spare_part","id":456}` |
| Flashlight | Qorong'ida yoritgich yoqish |
| Galereya | Rasmdan QR-kodni o'qish |

**Format:**
```json
{
  "type": "equipment",     // yoki "spare_part"
  "id": 123
}
```

**Navigatsiya:**
- `type=equipment` → Uskuna tafsilot ekraniga
- `type=spare_part` → Ehtiyot qism sahifasiga

---

### 2.4 Uskuna kartochkasi

**Fayl:** `lib/screens/equipment/equipment_detail_screen.dart`

| Bo'lim | Tavsif |
|--------|--------|
| Asosiy ma'lumotlar | Nomi, inv. raqami, toifa, status, joylashuv |
| Status badge | Rangli status ko'rsatkichi |
| Foto galereya | Horizontal scroll carousel |
| Hujjatlar | Ro'yxat ko'rinishida |
| QR-kod ko'rish | Uskuna QR-kodini ko'rsatish |
| Status tarixchasi | Timeline ko'rinishida |
| Harakatlar | Status o'zgartirish (operator uchun) |

**API endpointlar:**
```
GET    /api/v1/equipment/{id}                → Uskuna ma'lumotlari
GET    /api/v1/equipment/{id}/photos         → Rasmlar
GET    /api/v1/equipment/{id}/documents      → Hujjatlar
GET    /api/v1/equipment/{id}/status-history → Tarix
PATCH  /api/v1/equipment/{id}/status         → Status o'zgartirish
```

---

### 2.5 PPR vazifalari ro'yxati

**Fayl:** `lib/screens/ppr/ppr_list_screen.dart`

| Funksiya | Tavsif |
|----------|--------|
| Ro'yxat ko'rinishi | Card-based, rangli badge bilan |
| Filtrlar | Status (4 ta), Ustuvorlik, Sana diapazoni |
| Tab navigatsiya | Barchasi / Meniki / Muddati o'tgan |
| Pull-to-refresh | Yangilash |
| Qidiruv | Uskuna nomi, vazifa raqami bo'yicha |
| Infinite scroll | Paginatsiya (20 ta per sahifa) |

**API endpointlar:**
```
GET    /api/v1/ppr/tasks                → Filtrlangan ro'yxat
GET    /api/v1/ppr/tasks/overdue        → Muddati o'tgan
```

---

### 2.6 PPR vazifa tafsilotlari

**Fayl:** `lib/screens/ppr/ppr_detail_screen.dart`

| Bo'lim | Tavsif |
|--------|--------|
| **Ma'lumotlar** | Uskuna, tur, sana, mas'ul, ustuvorlik |
| **Status o'zgartirish** | Lifecycle: Reja → Jarayon → Bajarildi → Tasdiqlandi |
| **Chek-list** | Bandlarni belgilash + bajarilmagan bandlarga izoh |
| **Izohlar** | Dialog ko'rinishida qo'shish |
| **Vaqt hisobi** | Timer yoki qo'lda (soat:minut) kiritish |
| **Fotosuratlar** | "Oldin" va "Keyin" bo'limlari |

**Chek-list interaksiya:**
```
1. ✅ Tashqi ko'rik — bajarildi
2. ✅ Moylash — bajarildi
3. ❌ Ehtiyot qism almashtirish — izoh: "Qism omborga kelmagan"
```

**API endpointlar:**
```
GET    /api/v1/ppr/tasks/{id}                        → Vazifa ma'lumotlari
PATCH  /api/v1/ppr/tasks/{id}/status                 → Status o'zgartirish
GET    /api/v1/ppr/tasks/{id}/checklist               → Chek-list
PATCH  /api/v1/ppr/tasks/{id}/checklist/{itemId}/toggle → Band belgilash
POST   /api/v1/ppr/tasks/{id}/comments                → Izoh qo'shish
POST   /api/v1/ppr/tasks/{id}/time-entries             → Vaqt kiritish
GET    /api/v1/ppr/tasks/{id}/total-time               → Jami vaqt
```

---

### 2.7 Foto yuklash (Oldin/Keyin)

**Fayl:** `lib/screens/ppr/photo_upload_screen.dart`

| Funksiya | Tavsif |
|----------|--------|
| Kameradan olish | `image_picker` — to'g'ridan-to'g'ri kameradan |
| Gallereyadan tanlash | Telefon gallereyasidan |
| Siqish | Rasmni 1MB gacha siqish (quality: 70%) |
| Upload progress | Progress bar ko'rsatish |
| EXIF metadata | Sana, vaqt, GPS avtomatik yoziladi |
| Bo'lim ajratish | "Oldin" va "Keyin" alohida yuklash |

**API endpointlar:**
```
POST   /api/v1/ppr/tasks/{id}/photos     → FormData: file + type (BEFORE/AFTER)
GET    /api/v1/ppr/tasks/{id}/photos     → Foto ro'yxati
DELETE /api/v1/ppr/tasks/{id}/photos/{photoId}
```

---

### 2.8 Ariza yuborish

**Fayl:** `lib/screens/requests/create_request_screen.dart`

| Maydon | Tavsif | Majburiy |
|--------|--------|----------|
| Uskuna | Dropdown yoki QR skanerlash orqali tanlash | ✅ |
| Ariza turi | Ta'mirlash / Almashtirish / Boshqa | ✅ |
| Tavsif | Muammo tavsifi (erkin matn) | ✅ |
| Ustuvorlik | Past / O'rta / Yuqori | ✅ |
| Foto | Muammo fotosurati (ixtiyoriy, kameradan) | Yo'q |

**API endpointlar:**
```
POST   /api/v1/requests               → Ariza yaratish
GET    /api/v1/requests/my             → Mening arizalarim
GET    /api/v1/requests/{id}           → Ariza tafsilotlari
```

---

### 2.9 Xabarnomalar (Push-notification)

**Fayl:** `lib/services/notification_service.dart`

| Xabar turi | Trigger | Kanal |
|------------|---------|-------|
| Yangi vazifa tayinlandi | PPR vazifa yaratilganda | Push |
| Muddati yaqinlashmoqda | 3 kun oldin | Push + Local |
| Muddati o'tdi | Sana o'tganda | Push + Local |
| Ariza ko'rib chiqildi | Status o'zgarganda | Push |
| Kam qoldiq ogohlantirish | Chegara ostida | Push |

**Texnik yechim:**
- Firebase Cloud Messaging (FCM) — Android + iOS
- Backend deviceToken saqlaydi
- Server tomonidan trigger bo'lganda FCM orqali yuboriladi

**API endpointlar:**
```
POST   /api/v1/devices/register       → { deviceToken, platform }
DELETE /api/v1/devices/{token}         → Chiqishda o'chirish
GET    /api/v1/notifications           → Xabarnomalar tarixi
PATCH  /api/v1/notifications/{id}/read → O'qildi belgilash
```

---

### 2.10 Profil va sozlamalar

**Fayl:** `lib/screens/profile/profile_screen.dart`

| Funksiya | Tavsif |
|----------|--------|
| Profil ko'rish | F.I.O., roli, email, telefon |
| Profil tahrirlash | F.I.O., telefon, email |
| Parol o'zgartirish | Eski + Yangi + Tasdiqlash |
| Til tanlash | UZ / RU — darhol o'zgaradi |
| Bildirishnoma sozlash | Push on/off, ovoz on/off |
| Tizim haqida | Versiya, backend URL |
| Chiqish | Token o'chirish + Login ga qaytish |

---

## 3. TEXNIK ARXITEKTURA

### 3.1 Papka tuzilishi

```
lib/
├── main.dart                          # Entry point
├── app.dart                           # MaterialApp + Router
│
├── core/
│   ├── constants/                     # API URL, ranglar, o'lchamlar
│   ├── theme/                         # AppTheme (light/dark)
│   ├── utils/                         # Helpers, formatters
│   └── extensions/                    # Dart extensions
│
├── data/
│   ├── api/
│   │   ├── api_client.dart            # Dio instance + interceptors
│   │   ├── auth_interceptor.dart      # JWT token qo'shish
│   │   └── error_handler.dart         # API xatolarni qayta ishlash
│   ├── models/                        # JSON serialization models
│   │   ├── user.dart
│   │   ├── equipment.dart
│   │   ├── ppr_task.dart
│   │   ├── checklist_item.dart
│   │   ├── spare_part.dart
│   │   ├── user_request.dart
│   │   └── notification.dart
│   ├── repositories/                  # Repository pattern
│   │   ├── auth_repository.dart
│   │   ├── equipment_repository.dart
│   │   ├── ppr_repository.dart
│   │   └── request_repository.dart
│   └── providers/                     # Riverpod providers
│       ├── auth_provider.dart
│       ├── equipment_provider.dart
│       └── ppr_provider.dart
│
├── screens/
│   ├── auth/                          # Login, splash
│   ├── home/                          # Dashboard
│   ├── scanner/                       # QR scanner
│   ├── equipment/                     # Uskuna kartochka
│   ├── ppr/                           # PPR ro'yxat, tafsilot
│   ├── requests/                      # Arizalar
│   ├── profile/                       # Profil
│   └── notifications/                 # Xabarnomalar
│
├── widgets/
│   ├── common/                        # Button, Card, Badge, ...
│   ├── equipment/                     # Uskuna-specific widgetlar
│   └── ppr/                           # PPR-specific widgetlar
│
├── l10n/
│   ├── app_uz.arb                     # O'zbek tarjima
│   └── app_ru.arb                     # Rus tarjima
│
└── services/
    ├── notification_service.dart      # FCM + local notifications
    ├── storage_service.dart           # Secure storage wrapper
    └── connectivity_service.dart      # Internet holati kuzatuv
```

### 3.2 API Client konfiguratsiya

```dart
// lib/data/api/api_client.dart
class ApiClient {
  late final Dio _dio;

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.baseUrl,     // /api/v1
      connectTimeout: Duration(seconds: 15),
      receiveTimeout: Duration(seconds: 15),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.addAll([
      AuthInterceptor(),                // JWT token qo'shish
      LogInterceptor(logPrint: log),    // Debug log
      RetryInterceptor(dio: _dio),      // Qayta urinish
    ]);
  }
}
```

### 3.3 Offline qo'llab-quvvatlash

| Holat | Harakat |
|-------|--------|
| Internet yo'q | Keshlangan ma'lumotlarni ko'rsatish |
| Internet qaytdi | Kutilayotgan operatsiyalarni sync qilish |
| Foto yuklash | Navbatga qo'yish, internet bo'lganda yuklash |
| Chek-list | Lokal belgilash, sync qilish |

**Texnik yechim:** `hive` yoki `drift` lokal bazasi + sync queue

---

## 4. UI/UX DIZAYN TALABLARI

### 4.1 Dizayn tizimi

| Element | Xususiyat |
|---------|-----------|
| Ranglar | Primary: #2563EB, Success: #22C55E, Danger: #EF4444 |
| Shrift | Inter yoki system default |
| Burchak radius | 16px (kartalar), 12px (tugmalar), 8px (inputlar) |
| Soyalar | `elevation: 2` — kartalar, `elevation: 4` — modal |
| Animatsiyalar | 300ms, Curves.easeInOut — barcha o'tishlar |
| Dark mode | Tizim sozlamasiga moslashadi (ixtiyoriy) |

### 4.2 Navigatsiya

```
BottomNavigationBar (4 tab):
├── 🏠 Bosh sahifa (Dashboard)
├── 📋 PPR vazifalari
├── 📷 QR skanerlash (markaziy, kattaroq)
└── 👤 Profil
```

### 4.3 Loading holatlari

| Holat | UI |
|-------|----|
| Sahifa yuklanmoqda | Shimmer skeleton |
| Tugma yuklash | CircularProgressIndicator + disabled |
| Pull-to-refresh | RefreshIndicator |
| Infinite scroll | Pastda spinner |
| Xato | SnackBar (qizil) + qayta urinish tugma |

---

## 5. XAVFSIZLIK

### 5.1 Token boshqaruvi

| Parametr | Qiymat |
|----------|--------|
| Access token saqlash | `flutter_secure_storage` (Keychain/Keystore) |
| Auto refresh | 401 xatoda avtomatik yangilash |
| Logout | Barcha tokenlarni o'chirish |
| Session timeout | 30 daqiqa faolsizlikdan keyin |

### 5.2 Ma'lumot himoyasi

- HTTPS majburiy (certificate pinning ixtiyoriy)
- Ekran tasvirlashni bloklash (ixtiyoriy): `flutter_windowmanager`
- Root/Jailbreak aniqlash (ixtiyoriy): `flutter_jailbreak_detection`
- Lokal kesh shifrlangan

---

## 6. PUSH-NOTIFICATION ARXITEKTURASI

### 6.1 Oqim diagrammasi

```
Backend Event (PPR muddati o'tdi)
    │
    ▼
NotificationService (Java)
    │
    ▼
Firebase Cloud Messaging (FCM)
    │
    ├── Android → Firebase SDK → NotificationChannel
    └── iOS → APNs → UNUserNotificationCenter
    │
    ▼
Flutter onMessage / onBackgroundMessage
    │
    ▼
flutter_local_notifications → UI ko'rsatish
```

### 6.2 Xabar formati

```json
{
  "notification": {
    "title": "⚠️ PPR muddati o'tdi",
    "body": "Server HP ProLiant — texnik ko'rik 3 kun kechikdi"
  },
  "data": {
    "type": "ppr_overdue",
    "taskId": "42",
    "equipmentId": "15"
  }
}
```

---

## 7. SINOVDAN O'TKAZISH

### 7.1 Test turlari

| # | Test turi | Tavsif |
|---|----------|--------|
| 1 | Unit test | Repository, Provider, Model testlari |
| 2 | Widget test | Har bir ekran va widget uchun |
| 3 | Integration test | Login → QR scan → PPR bajarish oqimi |
| 4 | Device test | Samsung, Xiaomi, iPhone 12+, iPad |
| 5 | Performance | 1000+ uskuna bilan ro'yxat tezligi |

### 7.2 Test qurilmalari

| Platforma | Qurilma | OS versiya |
|-----------|---------|------------|
| Android | Samsung Galaxy A54 | Android 13+ |
| Android | Xiaomi Redmi Note 12 | Android 12+ |
| iOS | iPhone 13 | iOS 16+ |
| iOS | iPhone SE (kichik ekran) | iOS 16+ |

---

## 8. DEPLOY VA TARQATISH

### 8.1 Android

| Kanal | Tavsif |
|-------|--------|
| APK | Bevosita o'rnatish uchun (test) |
| AAB | Google Play Store uchun |
| Firebase App Distribution | Beta test uchun |

### 8.2 iOS

| Kanal | Tavsif |
|-------|--------|
| TestFlight | Beta test uchun |
| App Store | Production release |

### 8.3 CI/CD

```yaml
# GitHub Actions yoki Codemagic
Trigger: master branch ga push
Pipeline:
  1. Flutter analyze (lint)
  2. Flutter test (unit + widget)
  3. Flutter build apk --release
  4. Flutter build ipa --release
  5. Firebase App Distribution ga yuklash
```

### 8.4 Versiya boshqaruvi

```
Semantic Versioning: MAJOR.MINOR.PATCH
Masalan: 1.0.0 → 1.1.0 → 1.1.1 → 2.0.0
```

---

## 9. BAJARISH JADVALI

| Bosqich | Tavsif | Muddat |
|---------|--------|--------|
| 1 | Arxitektura + Auth + Profil | 1 hafta |
| 2 | QR skanerlash + Uskuna kartochka | 1 hafta |
| 3 | PPR ro'yxat + tafsilot + chek-list | 1.5 hafta |
| 4 | Foto yuklash + Ariza + Xabarnomalar | 1 hafta |
| 5 | i18n + Offline + Polishing + Test | 1 hafta |
| 6 | Beta test + Store deploy | 0.5 hafta |
| **JAMI** | | **~6 hafta** |

---

## 10. BACKEND QO'SHIMCHA ENDPOINTLAR

Mobil ilova uchun backend da quyidagi yangi endpointlar kerak:

```
# Push-notification uchun
POST   /api/v1/devices/register         → Device token ro'yxatdan o'tkazish
DELETE /api/v1/devices/{token}           → Device token o'chirish

# Xabarnomalar
GET    /api/v1/notifications             → Foydalanuvchi xabarlari
PATCH  /api/v1/notifications/{id}/read   → O'qildi belgilash
GET    /api/v1/notifications/unread-count → O'qilmagan soni

# PPR foto (oldin/keyin)
POST   /api/v1/ppr/tasks/{id}/photos     → type=BEFORE|AFTER
GET    /api/v1/ppr/tasks/{id}/photos     → Foto ro'yxati
```
