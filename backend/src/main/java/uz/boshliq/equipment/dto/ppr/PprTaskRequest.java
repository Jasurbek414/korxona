package uz.boshliq.equipment.dto.ppr;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * PPR vazifasi yaratish/tahrirlash uchun DTO.
 */
@Data
public class PprTaskRequest {
    @NotNull(message = "Uskuna tanlanishi shart")
    private Long equipmentId;

    @NotNull(message = "PPR turi tanlanishi shart")
    private Long pprTypeId;

    private Long serviceIntervalId;

    private Long assignedToId;

    @NotNull(message = "Rejalashtirilgan sana kiritilishi shart")
    private LocalDate scheduledDate;

    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    private String description;
}
