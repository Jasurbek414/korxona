-- =============================================
-- V1: Bazaviy tizim jadvallari
-- Uskunalarni hisobga olish tizimi
-- =============================================

-- Foydalanuvchilar
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'VIEWER',
    language VARCHAR(5) NOT NULL DEFAULT 'UZ',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP,
    avatar_path VARCHAR(500),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Uskuna toifalari
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name_uz VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100),
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Ishlab chiqaruvchilar
CREATE TABLE manufacturers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Modellar
CREATE TABLE models (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    manufacturer_id BIGINT REFERENCES manufacturers(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Joylashuvlar
CREATE TABLE locations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    building VARCHAR(100),
    floor VARCHAR(20),
    room VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Mas'ul shaxslar
CREATE TABLE responsible_persons (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    position VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Statuslar
CREATE TABLE statuses (
    id BIGSERIAL PRIMARY KEY,
    name_uz VARCHAR(50) NOT NULL,
    name_ru VARCHAR(50),
    color VARCHAR(20),
    description VARCHAR(300),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Hujjat turlari
CREATE TABLE document_types (
    id BIGSERIAL PRIMARY KEY,
    name_uz VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Uskunalar (asosiy jadval)
CREATE TABLE equipment (
    id BIGSERIAL PRIMARY KEY,
    inventory_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    manufacturer_id BIGINT REFERENCES manufacturers(id),
    model_id BIGINT REFERENCES models(id),
    serial_number VARCHAR(100),
    status_id BIGINT NOT NULL REFERENCES statuses(id),
    location_id BIGINT NOT NULL REFERENCES locations(id),
    responsible_person_id BIGINT NOT NULL REFERENCES responsible_persons(id),
    commissioned_date DATE,
    warranty_date DATE,
    purchase_price NUMERIC(15,2),
    notes VARCHAR(2000),
    qr_code_path VARCHAR(500),
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_equipment_inventory ON equipment(inventory_number);
CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_equipment_status ON equipment(status_id);
CREATE INDEX idx_equipment_location ON equipment(location_id);

-- Uskuna status tarixi
CREATE TABLE equipment_status_history (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id),
    old_status_id BIGINT REFERENCES statuses(id),
    new_status_id BIGINT NOT NULL REFERENCES statuses(id),
    changed_by BIGINT REFERENCES users(id),
    reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Hujjatlar
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id),
    document_type_id BIGINT REFERENCES document_types(id),
    name VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    content_type VARCHAR(100),
    uploaded_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Fotosuratlar
CREATE TABLE photos (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id),
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(200),
    file_size BIGINT,
    description VARCHAR(300),
    uploaded_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Audit jurnali
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(50),
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at);
