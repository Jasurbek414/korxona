package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * TZ 4.2: Ombor qoldiqlari — har bir ombordagi har bir ehtiyot qism qoldig'i.
 */
@Entity
@Table(name = "warehouse_stocks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"warehouse_id", "spare_part_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WarehouseStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spare_part_id", nullable = false)
    private SparePart sparePart;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
