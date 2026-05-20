package uz.boshliq.equipment.dto.equipment;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Status o'zgarish tarixi javob DTO si.
 */
@Data
public class StatusHistoryResponse {
    private Long id;
    private String oldStatusName;
    private String oldStatusColor;
    private String newStatusName;
    private String newStatusColor;
    private String changedByName;
    private String reason;
    private LocalDateTime createdAt;
}
