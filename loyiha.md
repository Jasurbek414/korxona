# TEXNIK TOPSHIRIQ

## Uskunalarni hisobga olish va boshqarish axborot tizimini ishlab chiqish

**Hujjat versiyasi:** 1.0  
**Sana:** 2026-05-20  
**Umumiy hajm:** 4 shartli birlik (4 bosqich)

---

## 1. UMUMIY MA'LUMOT

### 1.1 Loyihaning maqsadi

Tashkilotdagi barcha texnik uskunalarni raqamli tarzda hisobga olish, ularga rejali-profilaktik ta'mirlash (PPR) ishlarini rejalashtirish, ehtiyot qismlar va materiallar omborini boshqarish, hamda tizimni analitika, xavfsizlik va monitoring bilan ta'minlash uchun yagona axborot tizimini ishlab chiqish.

### 1.2 Tizim foydalanuvchilari

| Rol | Vakolatlari |
|-----|------------|
| **Administrator** | Tizimning barcha funksiyalariga to'liq kirish, foydalanuvchilarni boshqarish, sozlamalar, hisobotlar, xavfsizlik |
| **Mas'ul xodim (Operator)** | Uskunalar bilan ishlash, PPR vazifalarini bajarish, ombor operatsiyalari, chek-listlar to'ldirish |
| **Ko'ruvchi foydalanuvchi** | Faqat ma'lumotlarni ko'rish: uskunalar, hisobotlar, PPR holati |

### 1.3 Til qo'llab-quvvatlashi

- O'zbek tili
- Rus tili
- Interfeys elementlari, xabarlar va hisobotlar ikki tilda

### 1.4 Texnologiya steki

#### Backend (Server qismi)

| Texnologiya | Versiya | Vazifasi |
|------------|---------|----------|
| **Java** | 17+ | Asosiy dasturlash tili |
| **Spring Boot** | 3.x | Backend framework |
| **Spring Security** | — | Avtorizatsiya, JWT, 2FA, IP cheklash |
| **Spring Data JPA** | — | Ma'lumotlar bazasi bilan ishlash (ORM) |
| **Hibernate** | — | JPA implementatsiyasi |
| **Swagger / OpenAPI** | 3.0 | API dokumentatsiyasi |
| **Maven / Gradle** | — | Loyiha boshqaruvi va dependencylar |
| **Lombok** | — | Boilerplate kodni kamaytirish |
| **JavaMail** | — | Email xabarnomalar yuborish |
| **Apache POI** | — | Excel import/export |
| **ZXing** | — | QR-kod va shtrix-kod generatsiyasi |

#### Frontend (Web interfeys)

| Texnologiya | Versiya | Vazifasi |
|------------|---------|----------|
| **React JS** | 18+ | UI framework |
| **TailwindCSS** | 3.x | Stilizatsiya (CSS framework) |
| **React Router** | 6+ | Sahifalar navigatsiyasi |
| **Axios** | — | HTTP so'rovlar (API bilan aloqa) |
| **Chart.js / Recharts** | — | Grafiklar va diagrammalar (Dashboard) |
| **React-i18next** | — | Ikki tilni qo'llab-quvvatlash (uz/ru) |
| **React Hook Form** | — | Formalar bilan ishlash |
| **Vite** | 5+ | Build tool (tez ishga tushirish) |

#### Mobil ilova

| Texnologiya | Versiya | Vazifasi |
|------------|---------|----------|
| **Flutter** | 3.x | Cross-platform mobil framework |
| **Dart** | 3.x | Dasturlash tili |
| **mobile_scanner** | — | QR-kod va shtrix-kod skanerlash |
| **image_picker** | — | Kameradan foto olish (oldin/keyin) |
| **dio** | — | HTTP so'rovlar (API bilan aloqa) |
| **flutter_secure_storage** | — | Token va maxfiy ma'lumotlarni saqlash |
| **provider / riverpod** | — | State management |

#### Ma'lumotlar bazasi

| Texnologiya | Vazifasi |
|------------|----------|
| **PostgreSQL 15+** | Asosiy relyatsion ma'lumotlar bazasi |
| **Flyway / Liquibase** | DB migratsiyalarni boshqarish |
| **Redis** (ixtiyoriy) | Kesh va sessiya saqlash |

#### Infratuzilma va DevOps

| Texnologiya | Vazifasi |
|------------|----------|
| **Docker** | Konteynerizatsiya |
| **Docker Compose** | Serviceslarni orkestratsiya |
| **Nginx** | Reverse proxy, HTTPS, statik fayllar |
| **Let's Encrypt** | Bepul SSL sertifikat |
| **Git + GitHub/GitLab** | Versiya nazorati |
| **Telegram Bot API** | Telegram orqali xabarnomalar |
| **pg_dump / cron** | Ma'lumotlar bazasi zaxira nusxalash |

#### Tizim arxitekturasi sxemasi

```
┌──────────────────┐     ┌──────────────────┐
│   React JS Web   │     │  Flutter Mobile   │
│  + TailwindCSS   │     │   (Android/iOS)   │
└────────┬─────────┘     └────────┬──────────┘
         │         REST API       │
         └───────────┬────────────┘
                     │
              ┌──────▼──────┐
              │  Nginx      │
              │  (HTTPS)    │
              └──────┬──────┘
                     │
          ┌──────────▼──────────┐
          │  Java Spring Boot   │
          │  (Backend API)      │
          │  - Spring Security  │
          │  - JWT + 2FA        │
          │  - Swagger API      │
          └──────────┬──────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼───┐  ┌────▼───┐  ┌───▼────┐
    │PostgreSQL│ │ Redis  │  │ File   │
    │  (DB)   │ │(Cache) │  │Storage │
    └─────────┘ └────────┘  └────────┘
```

---

## 2. BOSQICH 1 — BAZAVIY TIZIM ARXITEKTURASI (1-shartli birlik)

### 2.1 Tizim arxitekturasi

- Backend va frontend ajratilgan (client-server arxitektura)
- RESTful API orqali aloqa
- Ma'lumotlar bazasi — PostgreSQL (relyatsion)
- Tizim kelajakda kengaytirish uchun modulli tuzilishda bo'lishi kerak

### 2.2 Ma'lumotlar bazasi strukturasi

Quyidagi asosiy jadvallar yaratiladi:

**Bazaviy jadvallar:**
- Foydalanuvchilar (users)
- Rollar (roles)
- Uskunalar (equipment)
- Uskuna toifalari (categories)
- Ishlab chiqaruvchilar (manufacturers)
- Modellar (models)
- Joylashuvlar (locations)
- Mas'ul shaxslar (responsible_persons)
- Statuslar (statuses)
- Hujjat turlari (document_types)
- Hujjatlar (documents)
- Fotosuratlar (photos)
- QR-kodlar (qr_codes)
- Uskuna status tarixi (equipment_status_history)

**PPR moduli jadvallari:**
- PPR vazifalari (ppr_tasks)
- PPR turlari (ppr_types)
- Xizmat ko'rsatish intervallari (service_intervals)
- Chek-list shablonlari (checklist_templates)
- Chek-list bandlari (checklist_items)
- Vazifa izohlari (task_comments)
- Vazifa fotosuratlar (task_photos)
- Vazifa ko'chirish tarixi (task_reschedule_history)
- Sarflangan vaqt (time_entries)
- Foydalanuvchi arizalari (user_requests)

**Ombor moduli jadvallari:**
- Ehtiyot qismlar (spare_parts)
- Ehtiyot qism toifalari (spare_part_categories)
- Omborlar (warehouses)
- Ombor qoldiqlari (warehouse_stock)
- Ombor operatsiyalari (warehouse_operations)
- Yetkazib beruvchilar (suppliers)

**Hisobotlar va xavfsizlik jadvallari:**
- Audit jurnali (audit_log)
- Xabarnomalar (notifications)
- Xabarnoma sozlamalari (notification_settings)
- IP whitelist (ip_whitelist)
- 2FA sozlamalari (two_factor_auth)
- Zaxira nusxa tarixi (backup_history)
- Tizim sozlamalari (system_settings)

### 2.3 Avtorizatsiya

- Login va parol orqali kirish
- Parollar xavfsiz tarzda (bcrypt hash) saqlanadi
- Sessiya boshqaruvi (token-based: JWT)
- Access token muddati: 30 daqiqa
- Refresh token muddati: 7 kun
- Noto'g'ri parol kiritishda urinishlar soni cheklanadi (5 marta, keyin 15 daqiqa bloklanadi)
- Tizimdan chiqish (logout) — tokenni bekor qilish

### 2.4 Parolni tiklash

- "Parolni unutdim" funksiyasi
- Email orqali parol tiklash havolasi yuboriladi
- Havola muddati: 1 soat
- Yangi parol kamida 8 belgi, katta/kichik harf va raqam majburiy
- Administrator boshqa foydalanuvchining parolini majburiy tiklashi mumkin

### 2.5 Foydalanuvchi profili

- Foydalanuvchi o'z profilini ko'rishi mumkin
- Parolni o'zgartirish (eski parolni kiritish shart)
- Profilni tahrirlash: F.I.O., telefon, email
- Profil rasmi yuklash (ixtiyoriy)
- Til tanlash (uz/ru) — foydalanuvchi darajasida saqlanadi

### 2.6 Foydalanuvchi rollari

- Har bir foydalanuvchiga 1 ta rol biriktiriladi
- Rol asosida interfeys elementlari va API endpointlar cheklanadi
- Administrator yangi foydalanuvchi qo'shishi va rolini o'zgartirishi mumkin
- Foydalanuvchini bloklash/aktivlashtirish imkoniyati
- Bloklangan foydalanuvchi tizimga kira olmaydi

### 2.7 Ma'lumotnomalar (Справочники)

Quyidagi ma'lumotnomalar CRUD (yaratish, ko'rish, tahrirlash, o'chirish) imkoniyati bilan:

| # | Ma'lumotnoma | Maydonlari |
|---|-------------|-----------|
| 1 | Uskuna toifalari | Nomi (uz/ru), tavsif |
| 2 | Ishlab chiqaruvchilar | Nomi, mamlakat |
| 3 | Modellar | Nomi, ishlab chiqaruvchi (bog'langan) |
| 4 | Joylashuvlar | Nomi, bino, qavat, xona |
| 5 | Mas'ul shaxslar | F.I.O., lavozimi, telefon, email |
| 6 | Statuslar | Nomi (uz/ru), rangi, tavsifi |
| 7 | Hujjat turlari | Nomi (uz/ru) |
| 8 | PPR turlari | Nomi (uz/ru), tavsif |
| 9 | O'lchov birliklari | Nomi (dona, metr, litr, kg) |

> **Muhim:** Ma'lumotnomalar o'chirilganda soft delete qo'llanadi — ma'lumot bazadan o'chirilmaydi, faqat `is_deleted=true` belgisi qo'yiladi. Bu bog'langan yozuvlar buzilishini oldini oladi.

### 2.8 Uskunalar ro'yxati

- Jadval ko'rinishida barcha uskunalarni ko'rsatish
- Paginatsiya (sahifalash): 20 ta yozuv per sahifa (sozlanishi mumkin)
- Ustunlar: inventar raqami, nomi, toifasi, modeli, holati, joylashuvi, mas'ul shaxs
- Uskunani o'chirish — soft delete (is_deleted=true)
- O'chirilgan uskunalarni ko'rish imkoniyati (administrator uchun)

### 2.9 Uskuna kartochkasi

Har bir uskuna uchun alohida sahifa quyidagi ma'lumotlar bilan:

| Maydon | Tavsif | Majburiy |
|--------|--------|----------|
| Inventar raqami | Yagona identifikator, avtomatik yoki qo'lda | ✅ Ha |
| Nomi | Uskuna nomi | ✅ Ha |
| Toifasi | Ma'lumotnomadan tanlanadi | ✅ Ha |
| Ishlab chiqaruvchi | Ma'lumotnomadan tanlanadi | Yo'q |
| Model | Ma'lumotnomadan tanlanadi | Yo'q |
| Seriya raqami | Qo'lda kiritiladi | Yo'q |
| Holati (status) | Ma'lumotnomadan tanlanadi | ✅ Ha |
| Joylashuv | Ma'lumotnomadan tanlanadi | ✅ Ha |
| Mas'ul shaxs | Ma'lumotnomadan tanlanadi | ✅ Ha |
| Foydalanishga topshirilgan sana | Sana formati (YYYY-MM-DD) | Yo'q |
| Kafolat muddati | Sana formati (YYYY-MM-DD) | Yo'q |
| Sotib olingan narxi | So'm yoki boshqa valyuta | Yo'q |
| Izoh | Erkin matn (max 2000 belgi) | Yo'q |
| Yaratilgan sana | Avtomatik (tizim tomonidan) | Avtomatik |
| Oxirgi tahrir sanasi | Avtomatik (tizim tomonidan) | Avtomatik |
| Yaratgan foydalanuvchi | Avtomatik (tizim tomonidan) | Avtomatik |

### 2.10 Uskuna statuslari

Standart statuslar (boshlang'ich ma'lumot sifatida yaratiladi):

| # | Status | Rang | Tavsif |
|---|--------|------|--------|
| 1 | Ishlamoqda | 🟢 Yashil | Uskuna foydalanishda |
| 2 | Ta'mirda | 🟡 Sariq | PPR yoki ta'mir jarayonida |
| 3 | Buzilgan | 🔴 Qizil | Ishdan chiqqan |
| 4 | Saqlashda | 🔵 Ko'k | Omborga topshirilgan |
| 5 | Hisobdan chiqarilgan | ⚫ Kulrang | Endi foydalanilmaydi |
| 6 | Yangi | 🟣 Binafsha | Hali foydalanishga topshirilmagan |

- Statusni o'zgartirish imkoniyati (dropdown yoki modal)
- Status o'zgarish tarixi saqlanadi (qachon, kim tomonidan, qaysi statusdan qaysi statusga)
- Statuslar rangli belgilar bilan ko'rsatiladi
- Administrator yangi statuslar qo'shishi mumkin

### 2.11 Hujjatlar va fotosuratlar

- Uskuna kartochkasiga hujjat biriktirish (PDF, DOC, XLS va boshqa formatlar)
- Hujjat turi, nomi, yuklangan sana, yuklagan foydalanuvchi ko'rsatiladi
- Fotosuratlarni yuklash va galereyada ko'rsatish
- Ruxsat etilgan fayl formatlari: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG
- Bitta fayl hajmi: max 10 MB
- Bitta uskuna uchun max 20 ta hujjat va 30 ta foto
- Fayllar serverda `/uploads/equipment/{equipment_id}/` papkasida saqlanadi
- Fayl nomiga yagona UUID qo'shiladi (nom to'qnashuvini oldini olish uchun)

### 2.12 QR-kod

- Har bir uskuna uchun QR-kod avtomatik generatsiya qilinadi
- QR-kodda JSON formatda: `{"type":"equipment","id":123}` kodlanadi
- QR-kodni yuklab olish (PNG/SVG) va chop etish imkoniyati
- Bir nechta uskuna uchun QR-kodlarni bitta sahifada chop etish (A4 formatda)
- QR-kodni skanerlash orqali uskuna kartochkasiga o'tish
- Shtrix-kod (barcode) ham ixtiyoriy ravishda ko'rsatiladi

### 2.13 Qidiruv, filtrlash va saralash

- Umumiy qidiruv: inventar raqami, nom, seriya raqami bo'yicha (debounce: 300ms)
- Filtrlar: toifa, status, joylashuv, mas'ul shaxs, ishlab chiqaruvchi
- Saralash: nomi, sanasi, statusi bo'yicha (o'sish/kamayish)
- Filtrlar kombinatsiyasi qo'llab-quvvatlanadi
- Tanlangan filtrlarni saqlash va URL da aks ettirish (sahifani yangilash/ulashish uchun)
- Excel ga eksport qilish (filtrlangan natijalarni)

---

## 3. BOSQICH 2 — PPR MODULI (1-shartli birlik)

### 3.1 PPR kalendari

- Oylik/haftalik/kunlik ko'rinishda PPR jadvali
- Kalendarda rejali ishlar rangli belgilar bilan ko'rsatiladi:
  - 🟢 Bajarilgan
  - 🟡 Kutilmoqda
  - 🔴 Muddati o'tgan
  - 🔵 Rejalashtirilgan

### 3.2 Xizmat ko'rsatish intervallari

- Har bir uskuna yoki uskuna guruhi uchun interval belgilash (kunlar, oylar)
- Masalan: "Har 30 kunda texnik ko'rik", "Har 6 oyda kapital ta'mir"
- Intervallar uskuna toifasi bo'yicha shablon sifatida saqlanishi mumkin

### 3.3 Avtomatik vazifa yaratish

- Belgilangan interval asosida tizim avtomatik yangi PPR vazifasini yaratadi
- Vazifaga avtomatik tayinlanadi: uskuna, mas'ul shaxs, muddati, turi
- Tizim har kuni (yoki belgilangan vaqtda) yangi vazifalarni tekshiradi va yaratadi

### 3.4 Vazifa boshqaruvi

| Maydon | Tavsif |
|--------|--------|
| Vazifa raqami | Avtomatik generatsiya |
| Uskuna | Bog'langan uskuna |
| Turi | PPR turi (texnik ko'rik, ta'mir, almashtirish va h.k.) |
| Mas'ul shaxs | Kim bajaradi |
| Rejalashtirilgan sana | Qachon bajarilishi kerak |
| Ustuvorlik | Past / O'rta / Yuqori / Kritik |
| Status | Rejalashtirilgan → Jarayonda → Bajarilgan → Tasdiqlangan |
| Izoh | Erkin matn |

### 3.5 Vazifani boshqa sanaga ko'chirish

- Vazifani yangi sanaga ko'chirish imkoniyati
- Ko'chirish sababi kiritilishi shart
- Ko'chirish tarixi saqlanadi

### 3.6 Ustuvorlik darajasi

- 4 daraja: Past, O'rta, Yuqori, Kritik
- Rangli belgilar bilan ajratiladi
- Filtrlash va saralash imkoniyati

### 3.7 Muddati o'tgan ishlar

- Muddati o'tgan vazifalar alohida ro'yxatda ko'rsatiladi
- Qizil rangda belgilanadi
- Necha kun muddati o'tgani ko'rsatiladi
- Administrator uchun umumiy statistika

### 3.8 Foydalanuvchi arizalari

- Operator yoki foydalanuvchi tomonidan ariza (so'rov) yaratish
- Ariza turi: ta'mir so'rovi, almashtirish so'rovi, boshqa
- Ariza holati: Yangi → Ko'rib chiqilmoqda → Tasdiqlangan → Bajarilgan → Rad etilgan
- Arizaga uskuna, tavsif, foto biriktirish

### 3.9 Chek-listlar

- Har bir PPR turi uchun chek-list shabloni yaratish
- Masalan: "Tashqi ko'rik ✓", "Moylash ✓", "Ehtiyot qism almashtirish ✓"
- Operator bajarish vaqtida har bir bandni belgilaydi
- Bajarilmagan bandlar uchun izoh majburiy

### 3.10 "Oldin/keyin" fotosuratlar

- Vazifani bajarishda "oldin" va "keyin" fotosuratlarini yuklash
- Fotosuratlar alohida bo'limlarda ko'rsatiladi
- Sana va vaqt avtomatik yoziladi

### 3.11 Izohlar

- Vazifaga izoh qoldirish (dialog ko'rinishida)
- Izoh muallifi va vaqti ko'rsatiladi
- Bir nechta izoh qo'shish mumkin

### 3.12 Sarflangan vaqt hisobi

- Vazifa bajarilganda sarflangan vaqtni kiritish (soat:minut)
- Avtomatik taymer (boshlash/to'xtatish) imkoniyati
- Hisobotlarda umumiy sarflangan vaqt ko'rsatiladi

---

## 4. BOSQICH 3 — OMBOR HISOBI VA MA'LUMOTLARNI YUKLASH (1-shartli birlik)

### 4.1 Ehtiyot qismlar katalogi

Har bir ehtiyot qism uchun quyidagi maydonlar:

| Maydon | Tavsif |
|--------|--------|
| Nomi | Ehtiyot qism nomi |
| Kod | Yagona identifikator (artikul) |
| O'lchov birligi | Dona, metr, litr, kg va h.k. |
| Narxi | So'm yoki boshqa valyutada |
| Minimal qoldiq | Ogohlantirish chegarasi |
| QR-kod | Avtomatik generatsiya |
| Shtrix-kod | Qo'lda kiritish yoki generatsiya |
| Toifasi | Guruhlash uchun |
| Tavsif | Erkin matn |

### 4.2 Omborlar

- Kamida 3 ta ombor bo'yicha qoldiqlarni yuritish
- Har bir omborning nomi, joylashuvi, mas'ul shaxsi
- Omborlar aro ko'chirish operatsiyasi
- Har bir omborning alohida qoldiq hisobi

### 4.3 Ombor operatsiyalari

| Operatsiya | Tavsif |
|-----------|--------|
| **Kirim** | Yangi ehtiyot qismlar qabul qilish: miqdor, yetkazib beruvchi, sana, hujjat raqami |
| **Chiqim** | Foydalanish uchun chiqarish: miqdor, sabab, qabul qiluvchi, sana |
| **Harakat** | Bir ombordan boshqasiga ko'chirish |
| **Hisobdan chiqarish** | Yaroqsiz yoki yo'qolgan ehtiyot qismlar: sabab, dalolatnoma |

- Barcha operatsiyalar tarixi saqlanadi
- Har bir operatsiyaga hujjat biriktirish mumkin

### 4.4 PPR bilan integratsiya

- PPR vazifasi bajarilganda ishlatilgan ehtiyot qismlarni ko'rsatish
- **Avtomatik chiqim**: chek-listda belgilangan ehtiyot qismlar avtomatik ombordan chiqariladi
- **Qo'lda chiqim**: operator qo'shimcha ehtiyot qismlarni qo'lda kiritadi
- Chiqarilgan ehtiyot qismlar PPR hisobotida aks etadi

### 4.5 Ogohlantirish mexanizmi

- Minimal qoldiqdan pastga tushganda ogohlantirish (interfeys + xabarnoma)
- Rezerv qoldiq belgilash imkoniyati
- Ogohlantirishlar ro'yxati administrator panelida ko'rsatiladi
- Kritik darajadagi qoldiqlar uchun alohida rangda belgilash

### 4.6 QR/Shtrix-kod bilan ishlash

- QR-kod yoki shtrix-kodni skanerlash orqali ehtiyot qismni aniqlash
- Skanerlash natijasida ehtiyot qism kartochkasi ochiladi
- Mobil qurilma kamerasi yoki maxsus skaner orqali ishlash

### 4.7 Excel orqali import

3 turdagi ma'lumotni import qilish:

| # | Ma'lumot turi | Asosiy maydonlari |
|---|--------------|-------------------|
| 1 | Uskunalar ro'yxati | Inventar raqami, nomi, toifasi, modeli, seriya raqami, joylashuvi |
| 2 | PPR jadvali | Uskuna, PPR turi, interval, mas'ul shaxs |
| 3 | Ehtiyot qismlar katalogi | Nomi, kodi, o'lchov birligi, narxi, minimal qoldiq |

Import jarayoni:
- Excel fayl shablonini yuklab olish imkoniyati
- Yuklangan faylni validatsiya qilish
- Xatoliklar ro'yxatini ko'rsatish (qator raqami, xato turi, tushuntirish)
- Faqat to'g'ri yozuvlarni saqlash
- Import natijasi haqida hisobot (muvaffaqiyatli / xato / jami)

---

## 5. BOSQICH 4 — HISOBOTLAR, XABARNOMALAR VA XAVFSIZLIK (1-shartli birlik)

### 5.1 Hisobotlar

Kamida 5 turdagi hisobot:

| # | Hisobot turi | Tarkibi |
|---|-------------|---------|
| 1 | **Uskunalar holati** | Statuslar bo'yicha guruhlangan ko'rsatkich, toifa/joylashuv bo'yicha filtr |
| 2 | **PPR bajarilishi** | Rejalashtirilgan vs bajarilgan ishlar, foiz ko'rsatkichi, davr bo'yicha |
| 3 | **Muddati o'tgan vazifalar** | Kechikkan ishlar ro'yxati, kechikish muddati, mas'ul shaxs |
| 4 | **Ehtiyot qismlar sarfi** | Davr bo'yicha ishlatilgan materiallar, summa, uskunalar kesimida |
| 5 | **Ombor qoldiqlari** | Joriy qoldiqlar, minimal chegaradan pastlar, omborlar kesimida |

Umumiy imkoniyatlar:
- Hisobotlarni PDF va Excel formatda yuklab olish
- Davr bo'yicha filtrlash (boshlanish/tugash sanasi)
- Qo'shimcha filtrlar: toifa, joylashuv, mas'ul shaxs

### 5.2 Boshqaruv paneli (Dashboard)

**Kamida 5 ta KPI ko'rsatkich:**

| # | KPI | Tavsif |
|---|-----|--------|
| 1 | Jami uskunalar soni | Toifalar bo'yicha taqsimlangan |
| 2 | PPR bajarilish foizi | Joriy oy/chorak uchun |
| 3 | Muddati o'tgan vazifalar | Soni va foizi |
| 4 | Ombordagi kritik qoldiqlar | Minimal chegaradan past ehtiyot qismlar |
| 5 | Bugungi vazifalar | Bugun bajarilishi kerak bo'lgan ishlar |

**Kamida 3 ta grafik:**

| # | Grafik | Turi |
|---|--------|------|
| 1 | Uskunalar holati | Doiraviy (Pie chart) |
| 2 | PPR bajarilishi (oylik trend) | Chiziqli/ustunli (Line/Bar chart) |
| 3 | Ehtiyot qismlar sarfi | Ustunli (Bar chart) |

- Dashboard real vaqtda yangilanadi
- Grafiklar interaktiv (ustiga bosganda tafsilot)

### 5.3 Xabarnomalar

**2 turdagi xabarnoma kanali:**

| Kanal | Sozlash |
|-------|---------|
| **Email** | SMTP sozlamalari, qabul qiluvchilar ro'yxati |
| **Telegram** | Bot token, chat/guruh ID |

**Xabarnoma turlari:**

| # | Turi | Tavsif |
|---|------|--------|
| 1 | Muddati yaqinlashgan vazifalar | Masalan, 3 kun oldin ogohlantirish |
| 2 | Muddati o'tgan vazifalar | Har kuni takroriy ogohlantirish |
| 3 | Minimal qoldiq ogohlantirishi | Omborda kam qolganda |

- Xabarnomalar sozlamalari administrator tomonidan boshqariladi
- Xabarnoma yuborish jadvali (soat va kunlar)

### 5.4 Audit jurnali

Quyidagi amallar qayd etiladi:

| Amal | Saqlanadigan ma'lumot |
|------|----------------------|
| Tizimga kirish/chiqish | Foydalanuvchi, vaqt, IP manzil |
| Ma'lumot yaratish | Kim, qachon, qaysi jadvalda, qanday ma'lumot |
| Ma'lumot o'zgartirish | Kim, qachon, eski qiymat, yangi qiymat |
| Ma'lumot o'chirish | Kim, qachon, o'chirilgan ma'lumot |
| Tasdiqlash amallari | Kim, qachon, nima tasdiqlangan |

- Audit jurnalini faqat administrator ko'rishi mumkin
- Filtrlar: foydalanuvchi, sana, amal turi
- Jurnalni eksport qilish (Excel/CSV)

### 5.5 Zaxira nusxalash (Backup)

- Ma'lumotlar bazasining avtomatik zaxira nusxasini yaratish
- Jadval bo'yicha (kunlik, haftalik)
- Zaxira fayllarni belgilangan joyga saqlash
- Oxirgi zaxira holati haqida ma'lumot

### 5.6 Ikki bosqichli autentifikatsiya (2FA)

- Administrator foydalanuvchilari uchun 2FA majburiy
- TOTP (Time-based One-Time Password) — Google Authenticator yoki shunga o'xshash
- QR-kod orqali sozlash
- Zaxira kodlar (recovery codes) berish

### 5.7 IP manzil bo'yicha cheklash

- Ruxsat etilgan IP manzillar ro'yxati (whitelist)
- Administrator tomonidan boshqariladi
- Cheklov yoqish/o'chirish imkoniyati
- Blоklangan urinishlar jurnalga yoziladi

### 5.8 HTTPS

- SSL/TLS sertifikati orqali xavfsiz ulanish
- HTTP dan HTTPS ga avtomatik yo'naltirish
- Zamonaviy shifrlash protokollari (TLS 1.2+)

### 6.6 Fayl saqlash strategiyasi

- Barcha yuklangan fayllar serverda lokal papkada saqlanadi
- Fayl joylashuvi: `/opt/app/uploads/` (Docker volume sifatida)
- Papka strukturasi:
  - `/uploads/equipment/{id}/documents/` — hujjatlar
  - `/uploads/equipment/{id}/photos/` — fotosuratlar
  - `/uploads/ppr/{task_id}/before/` — oldin fotosuratlar
  - `/uploads/ppr/{task_id}/after/` — keyin fotosuratlar
  - `/uploads/spare_parts/{id}/` — ehtiyot qism rasmlari
  - `/uploads/avatars/{user_id}/` — profil rasmlari
- Zaxira nusxalash vaqtida fayllar ham nusxalanadi

### 6.7 Ma'lumotlarni o'chirish siyosati (Soft Delete)

- Barcha asosiy yozuvlar soft delete orqali o'chiriladi
- `is_deleted` (boolean) va `deleted_at` (timestamp) maydonlari
- O'chirilgan yozuvlar oddiy so'rovlarda ko'rinmaydi
- Administrator o'chirilgan yozuvlarni ko'rishi va qayta tiklashi mumkin
- 90 kundan oshgan o'chirilgan yozuvlar avtomatik tozalanishi mumkin (sozlanishi mumkin)

### 6.8 Sana va vaqt standartlari

- Barcha sanalar serverda UTC formatda saqlanadi
- Frontend/Mobilda foydalanuvchi vaqt zonasiga konvertatsiya qilinadi
- Standart vaqt zonasi: `Asia/Tashkent` (UTC+5)
- Sana formati (interfeys): `DD.MM.YYYY` (masalan: 20.05.2026)
- Sana-vaqt formati: `DD.MM.YYYY HH:mm` (masalan: 20.05.2026 15:30)
- API da ISO 8601: `2026-05-20T15:30:00+05:00`

### 6.9 Xatolarni qayta ishlash

- Barcha API xatolar standart formatda qaytariladi:
  ```json
  {
    "status": 400,
    "error": "Bad Request",
    "message": "Inventar raqami allaqachon mavjud",
    "timestamp": "2026-05-20T15:30:00+05:00"
  }
  ```
- HTTP status kodlari: 200 (muvaffaqiyat), 201 (yaratildi), 400 (noto'g'ri so'rov), 401 (avtorizatsiya kerak), 403 (ruxsat yo'q), 404 (topilmadi), 500 (server xatosi)
- Validatsiya xatolari maydon bo'yicha ko'rsatiladi
- Server xatolari logga yoziladi (fayl + console)

### 6.10 API strukturasi

Barcha API endpointlar quyidagi standartga muvofiq:

- Bazaviy URL: `/api/v1/`
- Autentifikatsiya: `Authorization: Bearer {JWT_TOKEN}`

**Asosiy endpointlar:**

| Metod | Endpoint | Tavsif |
|-------|---------|--------|
| POST | `/api/v1/auth/login` | Tizimga kirish |
| POST | `/api/v1/auth/refresh` | Tokenni yangilash |
| POST | `/api/v1/auth/logout` | Tizimdan chiqish |
| POST | `/api/v1/auth/forgot-password` | Parolni tiklash |
| GET/POST | `/api/v1/users` | Foydalanuvchilar |
| GET/POST | `/api/v1/equipment` | Uskunalar |
| GET/POST | `/api/v1/categories` | Toifalar |
| GET/POST | `/api/v1/locations` | Joylashuvlar |
| GET/POST | `/api/v1/ppr/tasks` | PPR vazifalari |
| GET/POST | `/api/v1/ppr/schedules` | PPR jadvallari |
| GET/POST | `/api/v1/warehouse/parts` | Ehtiyot qismlar |
| GET/POST | `/api/v1/warehouse/operations` | Ombor operatsiyalari |
| GET | `/api/v1/reports/{type}` | Hisobotlar |
| GET | `/api/v1/dashboard` | Dashboard ma'lumotlari |
| GET | `/api/v1/audit-log` | Audit jurnali |

> Har bir CRUD resource uchun: `GET /` (ro'yxat), `GET /{id}` (bitta), `POST /` (yaratish), `PUT /{id}` (tahrirlash), `DELETE /{id}` (o'chirish)

### 6.11 Muhit konfiguratsiyalari (Environments)

| Muhit | Maqsad | Ma'lumotlar bazasi |
|-------|--------|--------------------|
| **development** | Lokal ishlab chiqish | Lokal PostgreSQL |
| **staging** | Test muhiti | Test PostgreSQL |
| **production** | Ishchi muhit | Production PostgreSQL |

- Har bir muhit uchun alohida `.env` fayl
- Muhim sozlamalar: DB_URL, JWT_SECRET, SMTP_HOST, TELEGRAM_BOT_TOKEN, UPLOAD_DIR
- Production da debug rejimi o'chirilgan bo'lishi shart

---

## 6. NOFUNKSIONAL TALABLAR

### 6.1 Ishlash samaradorligi

- Sahifalar 3 soniyadan oshmasligi kerak
- 50 ta bir vaqtda foydalanuvchini qo'llab-quvvatlash
- Ma'lumotlar bazasi 100,000+ yozuvni samarali qayta ishlashi kerak

### 6.2 Moslashuvchanlik

- Interfeys turli ekran o'lchamlariga moslashishi kerak (responsive design)
- Zamonaviy brauzerlarni qo'llab-quvvatlash (Chrome, Firefox, Edge, Safari)

### 6.3 Kengaytiriluvchanlik

- Modulli arxitektura — yangi funksiyalarni qo'shish oson bo'lishi kerak
- API dokumentatsiyasi (Swagger/OpenAPI)
- Kodda izohlar va hujjatlashtirish

### 6.4 Ma'lumotlar xavfsizligi

- Parollar bcrypt yoki shunga o'xshash algoritm bilan hash qilinadi
- SQL injection, XSS, CSRF himoyasi
- Fayl yuklashda tur va hajm tekshiruvi
- Sessiya muddati cheklangan (timeout)

### 6.5 Mobil ilova funksional doirasi

Mobil ilova (Flutter) quyidagi funksiyalarni qo'llab-quvvatlaydi:

| # | Funksiya | Tavsif |
|---|---------|--------|
| 1 | Avtorizatsiya | Login/parol + JWT token |
| 2 | QR-kod skanerlash | Uskuna va ehtiyot qismlarni aniqlash |
| 3 | Uskuna kartochkasini ko'rish | QR skanerlash orqali tezkor kirish |
| 4 | PPR vazifalar ro'yxati | Tayinlangan vazifalarni ko'rish |
| 5 | Chek-list to'ldirish | Vazifani bajarish jarayonida |
| 6 | Foto yuklash | "Oldin/keyin" fotosuratlarni kameradan olish |
| 7 | Izoh qoldirish | Vazifaga izoh yozish |
| 8 | Sarflangan vaqt | Taymer yoki qo'lda kiritish |
| 9 | Ariza yuborish | Ta'mir yoki almashtirish so'rovini yaratish |
| 10 | Xabarnomalar | Push-notification orqali ogohlantirish |

**Faqat web interfeysda ishlaydi (mobildan emas):**
- Ma'lumotnomalarni boshqarish
- Dashboard va hisobotlar
- Foydalanuvchilarni boshqarish
- Excel import/export
- Audit jurnali
- Tizim sozlamalari (2FA, IP cheklash, backup)

---

## 7. SINOVDAN O'TKAZISH

### 7.1 Test turlari

| # | Test turi | Tavsif |
|---|----------|--------|
| 1 | **Funksional test** | Barcha CRUD operatsiyalari, avtorizatsiya, rol cheklashlari, PPR vazifalari, ombor operatsiyalari ishlashini tekshirish |
| 2 | **Integratsion test** | Modullar aro bog'lanishlar: PPR → Ombor avtomatik chiqim, Dashboard → barcha modullar ma'lumotlari |
| 3 | **Xavfsizlik testi** | JWT tokenlar, 2FA, IP cheklash, SQL injection, XSS himoyasi |
| 4 | **Yuklama testi** | 50 ta bir vaqtda foydalanuvchi, 100,000+ yozuv bilan ishlash |
| 5 | **Mobil test** | QR skanerlash, foto yuklash, push-notification Android va iOS da |

### 7.2 Test ma'lumotlari

- Kamida 100 ta uskuna yozuvi
- Kamida 50 ta PPR vazifasi (turli statuslarda)
- Kamida 3 ta ombor, har birida 30+ ehtiyot qism
- Kamida 5 ta foydalanuvchi (har bir roldan)

---

## 8. TOPSHIRISH TARTIBI

### 8.1 Har bir bosqich uchun qabul qilish shartlari:

| # | Shart |
|---|-------|
| 1 | Modul test muhitida ishga tushirilgan |
| 2 | Asosiy funksiyalar test ma'lumotlari bilan tekshirilgan |
| 3 | Aniqlangan xatolar bartaraf etilgan |
| 4 | Buyurtmachiga foydalanish uchun topshirilgan |
| 5 | Qisqa foydalanish ko'rsatmasi berilgan (yakuniy bosqichda) |

### 8.2 Bosqichlar ketma-ketligi:

```
1-bosqich: Bazaviy tizim → 2-bosqich: PPR moduli → 3-bosqich: Ombor moduli → 4-bosqich: Hisobotlar va xavfsizlik
```

Har bir bosqich 1 shartli birlik sifatida alohida topshiriladi va qabul qilinadi.

### 8.3 Pilot ishga tushirish

- Yakuniy bosqichdan so'ng tizim pilot rejimda ishga tushiriladi
- Pilot davr: kamida 1 hafta
- Pilot davrda real ma'lumotlar bilan ishlash
- Aniqlangan muammolar operativ tarzda bartaraf etiladi
- Pilot davr yakunida tizim to'liq foydalanishga topshiriladi

### 8.4 Xodimlarni o'qitish

- Administrator uchun: tizimni to'liq boshqarish bo'yicha ko'rsatma
- Operator uchun: kundalik vazifalar (PPR, ombor) bo'yicha ko'rsatma
- Ko'ruvchi foydalanuvchi uchun: hisobotlar va ma'lumotlarni ko'rish bo'yicha ko'rsatma
- Qisqa video yoki PDF formatdagi foydalanish qo'llanmasi tayyorlanadi

---

## 9. DEPLOY (JOYLASH) STRATEGIYASI

### 9.1 Docker konteynerlar

```yaml
Serviceslar:
  - backend (Java Spring Boot) — port 8080
  - frontend (React + Nginx) — port 80/443
  - postgres (PostgreSQL 15) — port 5432
  - redis (ixtiyoriy) — port 6379
```

### 9.2 Server talablari (minimal)

| Komponent | Minimal | Tavsiya etilgan |
|-----------|---------|------------------|
| CPU | 2 yadroli | 4 yadroli |
| RAM | 4 GB | 8 GB |
| Disk | 50 GB SSD | 100 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### 9.3 Mobil ilova tarqatish

- Android: APK fayl yoki Google Play Store
- iOS: TestFlight yoki App Store
- Versiya boshqaruvi: Semantic Versioning (1.0.0, 1.1.0, ...)

---

## 10. QISQARTMALAR

| Qisqartma | Ma'nosi |
|-----------|---------|
| PPR | Rejali-profilaktik ta'mirlash (Планово-предупредительный ремонт) |
| CRUD | Create, Read, Update, Delete |
| KPI | Key Performance Indicator — asosiy samaradorlik ko'rsatkichi |
| 2FA | Two-Factor Authentication — ikki bosqichli autentifikatsiya |
| TOTP | Time-based One-Time Password |
| JWT | JSON Web Token |
| API | Application Programming Interface |
| QR | Quick Response (tezkor javob kodi) |
| ORM | Object-Relational Mapping |
| SMTP | Simple Mail Transfer Protocol |
| HTTPS | HyperText Transfer Protocol Secure |
| TLS | Transport Layer Security |
| REST | Representational State Transfer |
| UI | User Interface — foydalanuvchi interfeysi |
| DB | Database — ma'lumotlar bazasi |
| UUID | Universally Unique Identifier |
| UTC | Coordinated Universal Time |
| SSD | Solid State Drive |
