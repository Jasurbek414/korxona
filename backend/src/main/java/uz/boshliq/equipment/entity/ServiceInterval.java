package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * TZ 3.2: Xizmat ko'rsatish intervallari.
 * Uskuna yoki toifa bo'yicha intervalli PPR rejalash.
 */
@Entity
@Table(name = "service_intervals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ServiceInterval extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ppr_type_id", nullable = false)
    private PprType pprType;

    @Column(name = "interval_days", nullable = false)
    private Integer intervalDays;

    @Column(length = 500)
    private String description;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "last_executed_date")
    private LocalDate lastExecutedDate;

    @Column(name = "next_due_date")
    private LocalDate nextDueDate;
}
