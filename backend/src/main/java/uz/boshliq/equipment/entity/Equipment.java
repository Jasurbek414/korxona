package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Uskunalar (equipment) — tizimning asosiy entity si.
 * Inventar raqami, nomi, toifasi, modeli, joylashuvi, mas'ul shaxs va boshqa ma'lumotlar.
 */
@Entity
@Table(name = "equipment", indexes = {
        @Index(name = "idx_equipment_inventory", columnList = "inventory_number"),
        @Index(name = "idx_equipment_category", columnList = "category_id"),
        @Index(name = "idx_equipment_status", columnList = "status_id"),
        @Index(name = "idx_equipment_location", columnList = "location_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment extends BaseEntity {

    @Column(name = "inventory_number", nullable = false, unique = true, length = 50)
    private String inventoryNumber;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manufacturer_id")
    private Manufacturer manufacturer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id")
    private Model model;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", nullable = false)
    private Status status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsible_person_id", nullable = false)
    private ResponsiblePerson responsiblePerson;

    @Column(name = "commissioned_date")
    private LocalDate commissionedDate;

    @Column(name = "warranty_date")
    private LocalDate warrantyDate;

    @Column(name = "purchase_price", precision = 15, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "notes", length = 2000)
    private String notes;

    @Column(name = "qr_code_path")
    private String qrCodePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
}
