-- ====== Test ma'lumotlari (TZ 7.2) ======
-- Foydalanuvchilar (parol: Admin123!)
-- bcrypt hash for "Admin123!" 
INSERT INTO users (username, password, full_name, email, phone, role, is_active, language, created_at)
VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Adminov Admin', 'admin@boshliq.uz', '+998901234567', 'ADMIN', true, 'UZ', NOW()),
('operator1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Karimov Jasur', 'jasur@boshliq.uz', '+998901234568', 'OPERATOR', true, 'UZ', NOW()),
('operator2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Toshmatov Alisher', 'alisher@boshliq.uz', '+998901234569', 'OPERATOR', true, 'UZ', NOW()),
('viewer1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Rahimova Nilufar', 'nilufar@boshliq.uz', '+998901234570', 'VIEWER', true, 'UZ', NOW()),
('viewer2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sobirov Bekzod', 'bekzod@boshliq.uz', '+998901234571', 'VIEWER', true, 'UZ', NOW())
ON CONFLICT (username) DO NOTHING;

-- Statuslar
INSERT INTO statuses (name_uz, name_ru, color, description) VALUES
('Ishlamoqda', 'Работает', '#22c55e', 'Foydalanishda'),
('Tamirda', 'На ремонте', '#eab308', 'PPR yoki tamir'),
('Buzilgan', 'Сломан', '#ef4444', 'Ishdan chiqqan'),
('Saqlashda', 'На хранении', '#3b82f6', 'Omborga topshirilgan'),
('Hisobdan chiqarilgan', 'Списан', '#6b7280', 'Foydalanilmaydi'),
('Yangi', 'Новый', '#8b5cf6', 'Topshirilmagan')
ON CONFLICT DO NOTHING;

-- Toifalar
INSERT INTO categories (name_uz, name_ru, description) VALUES
('Kompyuterlar', 'Компьютеры', 'Shaxsiy kompyuterlar va noutbuklar'),
('Printerlar', 'Принтеры', 'Printer va MFU qurilmalar'),
('Server uskunalari', 'Серверное оборудование', 'Serverlar va tarmoq uskunalari'),
('Aloqa vositalari', 'Средства связи', 'Telefonlar va radio stansiyalar'),
('Ofis jihozlari', 'Офисная техника', 'Skaner, proyektor va boshqalar'),
('Elektr jihozlari', 'Электрооборудование', 'UPS, generatorlar'),
('Video kuzatuv', 'Видеонаблюдение', 'Kameralar va DVR'),
('Konditsionerlar', 'Кондиционеры', 'Split tizimlar')
ON CONFLICT DO NOTHING;

-- Ishlab chiqaruvchilar
INSERT INTO manufacturers (name, country) VALUES
('HP', 'AQSH'), ('Dell', 'AQSH'), ('Lenovo', 'Xitoy'),
('Samsung', 'Janubiy Koreya'), ('Canon', 'Yaponiya'), ('Epson', 'Yaponiya'),
('Cisco', 'AQSH'), ('Hikvision', 'Xitoy'), ('Daikin', 'Yaponiya'),
('APC', 'AQSH')
ON CONFLICT DO NOTHING;

-- Joylashuvlar
INSERT INTO locations (name, building, floor, room) VALUES
('Bosh ofis 101', 'Bosh bino', '1', '101'),
('Bosh ofis 201', 'Bosh bino', '2', '201'),
('Bosh ofis 202', 'Bosh bino', '2', '202'),
('Server xonasi', 'Bosh bino', '1', '100'),
('Ombor', 'Yordamchi bino', '1', '001'),
('Ishlab chiqarish sexi', 'Sex bino', '1', '001'),
('Kabinet 301', 'Bosh bino', '3', '301'),
('Kabinet 302', 'Bosh bino', '3', '302')
ON CONFLICT DO NOTHING;

-- Masul shaxslar
INSERT INTO responsible_persons (full_name, position, phone, email) VALUES
('Karimov Jasur', 'IT mutaxassis', '+998901111111', 'jasur@example.com'),
('Toshmatov Alisher', 'Texnik xodim', '+998902222222', 'alisher@example.com'),
('Rahimova Nilufar', 'Ofis menejeri', '+998903333333', 'nilufar@example.com'),
('Umarov Sardor', 'Bosh muhandis', '+998904444444', 'sardor@example.com'),
('Qodirov Sherzod', 'Elektrik', '+998905555555', 'sherzod@example.com')
ON CONFLICT DO NOTHING;

-- Hujjat turlari
INSERT INTO document_types (name_uz, name_ru) VALUES
('Pasport', 'Паспорт'), ('Kafolat varaqasi', 'Гарантийный лист'),
('Texnik hujjat', 'Техническая документация'), ('Qabul-topshiriq dalolatnomasi', 'Акт приема-передачи')
ON CONFLICT DO NOTHING;

-- PPR turlari
INSERT INTO ppr_types (name_uz, name_ru, description) VALUES
('Texnik korik', 'Технический осмотр', 'Muntazam tekshiruv'),
('Profilaktik tamir', 'Профилактический ремонт', 'Oldini olish tariri'),
('Kapital tamir', 'Капитальный ремонт', 'Toliq tamir'),
('Moylash', 'Смазка', 'Harakatlanuvchi qismlarni moylash'),
('Tozalash', 'Чистка', 'Changdan tozalash'),
('Ehtiyot qism almashtirish', 'Замена запчасти', 'Eskirgan qismni almashtirish')
ON CONFLICT DO NOTHING;

-- Olchov birliklari
INSERT INTO measurement_units (name) VALUES ('dona'), ('metr'), ('litr'), ('kg'), ('komplet')
ON CONFLICT DO NOTHING;
