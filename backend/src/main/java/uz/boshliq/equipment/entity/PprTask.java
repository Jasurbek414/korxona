package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * TZ 3.4: PPR vazifasi.
 * Status: SCHEDULED → IN_PROGRESS → COMPLETED → APPROVED
 * Priority: LOW, MEDIUM, HIGH, CRITICAL
 */
@Entity
@Table(name = "ppr_tasks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PprTask extends BaseEntity {

    @Column(name = "task_number", nullable = false, unique = true, length = 30)
    private String taskNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ppr_type_id", nullable = false)
    private PprType pprType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_interval_id")
    private ServiceInterval serviceInterval;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private ResponsiblePerson assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskStatus status = TaskStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "completion_notes", columnDefinition = "TEXT")
    private String completionNotes;

    @Column(name = "time_spent_minutes")
    @Builder.Default
    private Integer timeSpentMinutes = 0;

    public enum TaskPriority { LOW, MEDIUM, HIGH, CRITICAL }
    public enum TaskStatus { SCHEDULED, IN_PROGRESS, COMPLETED, APPROVED }
}
