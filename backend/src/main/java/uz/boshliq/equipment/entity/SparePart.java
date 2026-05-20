package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * TZ 4.1: Ehtiyot qismlar katalogi.
 */
@Entity
@Table(name = "spare_parts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SparePart extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private SparePartCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private MeasurementUnit unit;

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "min_stock")
    @Builder.Default
    private Integer minStock = 0;

    @Column(name = "reserve_stock")
    @Builder.Default
    private Integer reserveStock = 0;

    @Column(length = 100)
    private String barcode;

    @Column(name = "qr_code_path", length = 500)
    private String qrCodePath;

    @Column(columnDefinition = "TEXT")
    private String description;
}
