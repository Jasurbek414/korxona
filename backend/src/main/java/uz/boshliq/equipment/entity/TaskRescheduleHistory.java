package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * TZ 3.5: Vazifa ko'chirish tarixi.
 */
@Entity
@Table(name = "task_reschedule_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TaskRescheduleHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private PprTask task;

    @Column(name = "old_date", nullable = false)
    private java.time.LocalDate oldDate;

    @Column(name = "new_date", nullable = false)
    private java.time.LocalDate newDate;

    @Column(nullable = false, length = 500)
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rescheduled_by_id")
    private User rescheduledBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}
