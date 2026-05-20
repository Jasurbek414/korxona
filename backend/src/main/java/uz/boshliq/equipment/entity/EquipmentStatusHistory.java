package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Uskuna statuslari o'zgarish tarixi.
 * Qachon, kim tomonidan, qaysi statusdan qaysi statusga o'zgartirilganligi saqlanadi.
 */
@Entity
@Table(name = "equipment_status_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentStatusHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "old_status_id")
    private Status oldStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_status_id", nullable = false)
    private Status newStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private User changedBy;

    @Column(name = "reason", length = 500)
    private String reason;
}
