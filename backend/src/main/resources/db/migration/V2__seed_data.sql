-- =============================================
-- V2: Boshlang'ich ma'lumotlar (seed data)
-- =============================================

-- Administrator foydalanuvchi (parol: admin123 — bcrypt hash)
INSERT INTO users (username, password, full_name, email, role, language)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrator', 'admin@boshliq.uz', 'ADMIN', 'UZ');

-- Standart statuslar
INSERT INTO statuses (name_uz, name_ru, color, description) VALUES
('Ishlamoqda', 'Работает', '#22c55e', 'Uskuna foydalanishda'),
('Ta''mirda', 'В ремонте', '#eab308', 'PPR yoki ta''mir jarayonida'),
('Buzilgan', 'Неисправно', '#ef4444', 'Ishdan chiqqan'),
('Saqlashda', 'На хранении', '#3b82f6', 'Omborga topshirilgan'),
('Hisobdan chiqarilgan', 'Списано', '#6b7280', 'Endi foydalanilmaydi'),
('Yangi', 'Новое', '#a855f7', 'Hali foydalanishga topshirilmagan');

-- Standart hujjat turlari
INSERT INTO document_types (name_uz, name_ru) VALUES
('Pasport', 'Паспорт'),
('Kafolat xati', 'Гарантийный талон'),
('Ta''mirlash dalolatnomasi', 'Акт ремонта'),
('Qabul-topshirish dalolatnomasi', 'Акт приема-передачи'),
('Hisobdan chiqarish dalolatnomasi', 'Акт списания'),
('Boshqa', 'Прочее');
