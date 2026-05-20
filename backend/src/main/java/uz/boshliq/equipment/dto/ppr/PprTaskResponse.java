package uz.boshliq.equipment.dto.ppr;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * PPR vazifasi javob DTO.
 */
@Data
public class PprTaskResponse {
    private Long id;
    private String taskNumber;

    private Long equipmentId;
    private String equipmentName;
    private String equipmentInventoryNumber;

    private Long pprTypeId;
    private String pprTypeName;

    private Long assignedToId;
    private String assignedToName;

    private LocalDate scheduledDate;
    private LocalDate completedDate;
    private String priority;
    private String status;
    private String description;
    private String completionNotes;
    private Integer timeSpentMinutes;

    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Qo'shimcha — muddati o'tganlik
    private Integer overdueDays;
    private Boolean isOverdue;
}
