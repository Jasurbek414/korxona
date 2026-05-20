-- ====== H2 Dev Data (ON CONFLICT yo'q — MERGE ishlatamiz) ======
-- Parol: Admin123!
MERGE INTO users (id, username, password, full_name, email, phone, role, is_active, language, created_at) KEY(username)
VALUES
(1, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Adminov Admin', 'admin@boshliq.uz', '+998901234567', 'ADMIN', true, 'UZ', NOW()),
(2, 'operator1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Karimov Jasur', 'jasur@boshliq.uz', '+998901234568', 'OPERATOR', true, 'UZ', NOW()),
(3, 'viewer1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Rahimova Nilufar', 'nilufar@boshliq.uz', '+998901234570', 'VIEWER', true, 'UZ', NOW());

-- Statuslar
MERGE INTO statuses (id, name_uz, name_ru, color, description) KEY(id)
VALUES
(1, 'Ishlamoqda', 'Работает', '#22c55e', 'Foydalanishda'),
(2, 'Tamirda', 'На ремонте', '#eab308', 'PPR yoki tamir'),
(3, 'Buzilgan', 'Сломан', '#ef4444', 'Ishdan chiqqan'),
(4, 'Saqlashda', 'На хранении', '#3b82f6', 'Omborga topshirilgan'),
(5, 'Hisobdan chiqarilgan', 'Списан', '#6b7280', 'Foydalanilmaydi'),
(6, 'Yangi', 'Новый', '#8b5cf6', 'Topshirilmagan');

-- Toifalar
MERGE INTO categories (id, name_uz, name_ru, description) KEY(id)
VALUES
(1, 'Kompyuterlar', 'Компьютеры', 'Shaxsiy kompyuterlar va noutbuklar'),
(2, 'Printerlar', 'Принтеры', 'Printer va MFU qurilmalar'),
(3, 'Server uskunalari', 'Серверное оборудование', 'Serverlar va tarmoq uskunalari'),
(4, 'Ofis jihozlari', 'Офисная техника', 'Skaner, proyektor va boshqalar');

-- Ishlab chiqaruvchilar
MERGE INTO manufacturers (id, name, country) KEY(id)
VALUES (1, 'HP', 'AQSH'), (2, 'Dell', 'AQSH'), (3, 'Lenovo', 'Xitoy'), (4, 'Canon', 'Yaponiya');

-- Joylashuvlar
MERGE INTO locations (id, name, building, floor, room) KEY(id)
VALUES
(1, 'Bosh ofis 101', 'Bosh bino', '1', '101'),
(2, 'Server xonasi', 'Bosh bino', '1', '100'),
(3, 'Ombor', 'Yordamchi bino', '1', '001');

-- Masul shaxslar
MERGE INTO responsible_persons (id, full_name, position, phone, email) KEY(id)
VALUES
(1, 'Karimov Jasur', 'IT mutaxassis', '+998901111111', 'jasur@example.com'),
(2, 'Toshmatov Alisher', 'Texnik xodim', '+998902222222', 'alisher@example.com');

-- Hujjat turlari
MERGE INTO document_types (id, name_uz, name_ru) KEY(id)
VALUES (1, 'Pasport', 'Паспорт'), (2, 'Kafolat varaqasi', 'Гарантийный лист');

-- PPR turlari
MERGE INTO ppr_types (id, name_uz, name_ru, description) KEY(id)
VALUES
(1, 'Texnik korik', 'Технический осмотр', 'Muntazam tekshiruv'),
(2, 'Profilaktik tamir', 'Профилактический ремонт', 'Oldini olish tamiri'),
(3, 'Tozalash', 'Чистка', 'Changdan tozalash');

-- Olchov birliklari
MERGE INTO measurement_units (id, name) KEY(id) VALUES (1, 'dona'), (2, 'metr'), (3, 'kg');

-- Uskunalar
MERGE INTO equipment (id, inventory_number, name, category_id, manufacturer_id, status_id, location_id, responsible_person_id, serial_number, commissioned_date, purchase_price, created_by, created_at) KEY(id)
VALUES
(1, 'INV-2026-0001', 'HP ProDesk 400 G7', 1, 1, 1, 1, 1, 'SN-HP-001', '2024-03-15', 8500000, 1, NOW()),
(2, 'INV-2026-0002', 'Dell OptiPlex 3090', 1, 2, 1, 1, 1, 'SN-DELL-001', '2024-05-20', 9200000, 1, NOW()),
(3, 'INV-2026-0003', 'Canon MF264dw', 2, 4, 2, 3, 2, 'SN-CAN-001', '2023-11-10', 3200000, 1, NOW()),
(4, 'INV-2026-0004', 'Lenovo ThinkServer', 3, 3, 1, 2, 1, 'SN-LEN-001', '2024-01-08', 45000000, 1, NOW()),
(5, 'INV-2026-0005', 'HP LaserJet Pro', 2, 1, 3, 1, 2, 'SN-HP-002', '2022-07-15', 2800000, 1, NOW());
