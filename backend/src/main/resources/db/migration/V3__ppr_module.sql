-- =============================================
-- V3: PPR (Rejali Profilaktik Ish) moduli
-- TZ 3.1-3.12 talablari asosida
-- =============================================

-- PPR turlari ma'lumotnomasi
CREATE TABLE ppr_types (
    id BIGSERIAL PRIMARY KEY,
    name_uz VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100),
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Xizmat ko'rsatish intervallari (TZ 3.2)
CREATE TABLE service_intervals (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT REFERENCES equipment(id),
    category_id BIGINT REFERENCES categories(id),
    ppr_type_id BIGINT NOT NULL REFERENCES ppr_types(id),
    interval_days INT NOT NULL,
    description VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    last_executed_date DATE,
    next_due_date DATE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PPR vazifalari (TZ 3.4)
CREATE TABLE ppr_tasks (
    id BIGSERIAL PRIMARY KEY,
    task_number VARCHAR(30) NOT NULL UNIQUE,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id),
    ppr_type_id BIGINT NOT NULL REFERENCES ppr_types(id),
    service_interval_id BIGINT REFERENCES service_intervals(id),
    assigned_to_id BIGINT REFERENCES responsible_persons(id),
    created_by_id BIGINT REFERENCES users(id),

    scheduled_date DATE NOT NULL,
    completed_date DATE,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',

    description TEXT,
    completion_notes TEXT,
    time_spent_minutes INT DEFAULT 0,

    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chek-list shablonlari (TZ 3.9)
CREATE TABLE checklist_templates (
    id BIGSERIAL PRIMARY KEY,
    ppr_type_id BIGINT NOT NULL REFERENCES ppr_types(id),
    name VARCHAR(200) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chek-list shablondagi bandlar
CREATE TABLE checklist_template_items (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES checklist_templates(id),
    item_text VARCHAR(300) NOT NULL,
    sort_order INT DEFAULT 0,
    is_required BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vazifa chek-list bandlari (TZ 3.9)
CREATE TABLE task_checklist_items (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES ppr_tasks(id),
    item_text VARCHAR(300) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    notes VARCHAR(500),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vazifa ko'chirish tarixi (TZ 3.5)
CREATE TABLE task_reschedule_history (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES ppr_tasks(id),
    old_date DATE NOT NULL,
    new_date DATE NOT NULL,
    reason VARCHAR(500) NOT NULL,
    rescheduled_by_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vazifa izohlari (TZ 3.11)
CREATE TABLE task_comments (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES ppr_tasks(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vazifa fotosuratlar: oldin/keyin (TZ 3.10)
CREATE TABLE task_photos (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES ppr_tasks(id),
    photo_type VARCHAR(10) NOT NULL DEFAULT 'BEFORE',
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_size BIGINT,
    description VARCHAR(300),
    uploaded_by_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sarflangan vaqt (TZ 3.12)
CREATE TABLE time_entries (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES ppr_tasks(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INT,
    description VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Foydalanuvchi arizalari (TZ 3.8)
CREATE TABLE user_requests (
    id BIGSERIAL PRIMARY KEY,
    request_number VARCHAR(30) NOT NULL UNIQUE,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id),
    requested_by_id BIGINT NOT NULL REFERENCES users(id),
    request_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW',
    description TEXT NOT NULL,
    response_notes TEXT,
    responded_by_id BIGINT REFERENCES users(id),
    responded_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Boshlang'ich PPR turlari
INSERT INTO ppr_types (name_uz, name_ru, description) VALUES
('Texnik ko''rik', 'Технический осмотр', 'Uskunaning umumiy holatini tekshirish'),
('Moylash', 'Смазка', 'Harakatlanuvchi qismlarni moylash'),
('Ehtiyot qism almashtirish', 'Замена запчастей', 'Eskirgan qismlarni yangilash'),
('Kapital ta''mir', 'Капитальный ремонт', 'To''liq ta''mirlash ishlari'),
('Tozalash', 'Очистка', 'Uskuna va atrofini tozalash'),
('Kalibrlash', 'Калибровка', 'O''lchov asboblarini sozlash');
