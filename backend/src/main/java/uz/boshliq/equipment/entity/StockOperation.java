package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * TZ 4.3: Ombor operatsiyalari (kirim, chiqim, harakat, hisobdan chiqarish).
 */
@Entity
@Table(name = "stock_operations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockOperation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "operation_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private OperationType operationType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spare_part_id", nullable = false)
    private SparePart sparePart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_warehouse_id")
    private Warehouse targetWarehouse;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price_per_unit", precision = 15, scale = 2)
    private BigDecimal pricePerUnit;

    @Column(name = "total_price", precision = 15, scale = 2)
    private BigDecimal totalPrice;

    // Kirim
    @Column(length = 200)
    private String supplier;

    @Column(name = "document_number", length = 50)
    private String documentNumber;

    // Chiqim
    @Column(length = 500)
    private String reason;

    @Column(length = 200)
    private String receiver;

    // PPR integratsiya (TZ 4.4)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ppr_task_id")
    private PprTask pprTask;

    // Hisobdan chiqarish
    @Column(name = "act_number", length = 50)
    private String actNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_id")
    private User performedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public enum OperationType { INCOMING, OUTGOING, TRANSFER, WRITE_OFF }
}
