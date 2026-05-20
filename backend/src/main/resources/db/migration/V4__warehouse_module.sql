-- =============================================
-- V4: Ombor hisobi moduli
-- TZ 4.1-4.6 talablari asosida
-- =============================================

-- O'lchov birliklari ma'lumotnomasi
CREATE TABLE measurement_units (
    id BIGSERIAL PRIMARY KEY,
    name_uz VARCHAR(50) NOT NULL,
    name_ru VARCHAR(50),
    short_name VARCHAR(10) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ehtiyot qismlar toifasi
CREATE TABLE spare_part_categories (
    id BIGSERIAL PRIMARY KEY,
    name_uz VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ehtiyot qismlar katalogi (TZ 4.1)
CREATE TABLE spare_parts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    category_id BIGINT REFERENCES spare_part_categories(id),
    unit_id BIGINT REFERENCES measurement_units(id),
    price DECIMAL(15,2) DEFAULT 0,
    min_stock INT DEFAULT 0,
    reserve_stock INT DEFAULT 0,
    barcode VARCHAR(100),
    qr_code_path VARCHAR(500),
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Omborlar (TZ 4.2)
CREATE TABLE warehouses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(300),
    responsible_person_id BIGINT REFERENCES responsible_persons(id),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ombor qoldiqlari (TZ 4.2)
CREATE TABLE warehouse_stocks (
    id BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id),
    spare_part_id BIGINT NOT NULL REFERENCES spare_parts(id),
    quantity INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, spare_part_id)
);

-- Ombor operatsiyalari (TZ 4.3)
CREATE TABLE stock_operations (
    id BIGSERIAL PRIMARY KEY,
    operation_type VARCHAR(20) NOT NULL,
    spare_part_id BIGINT NOT NULL REFERENCES spare_parts(id),
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id),
    target_warehouse_id BIGINT REFERENCES warehouses(id),
    quantity INT NOT NULL,
    price_per_unit DECIMAL(15,2),
    total_price DECIMAL(15,2),

    -- Kirim
    supplier VARCHAR(200),
    document_number VARCHAR(50),

    -- Chiqim
    reason VARCHAR(500),
    receiver VARCHAR(200),

    -- PPR integratsiya (TZ 4.4)
    ppr_task_id BIGINT REFERENCES ppr_tasks(id),

    -- Hisobdan chiqarish
    act_number VARCHAR(50),

    performed_by_id BIGINT REFERENCES users(id),
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Boshlang'ich o'lchov birliklari
INSERT INTO measurement_units (name_uz, name_ru, short_name) VALUES
('Dona', 'Штука', 'don'),
('Metr', 'Метр', 'm'),
('Litr', 'Литр', 'l'),
('Kilogramm', 'Килограмм', 'kg'),
('Komplekt', 'Комплект', 'kompl'),
('Pachka', 'Пачка', 'p');

-- Boshlang'ich omborlar
INSERT INTO warehouses (name, location, description) VALUES
('Asosiy ombor', '1-bino, 1-qavat', 'Markaziy ehtiyot qismlar ombori'),
('Texnik ombor', '2-bino, tsiokol', 'Texnik xizmat uchun ombor'),
('Zaxira ombor', '3-bino', 'Zaxira materiallar ombori');
