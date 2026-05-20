package uz.boshliq.equipment.dto.ppr;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

/** Vazifani boshqa sanaga ko'chirish DTO (TZ 3.5) */
@Data
public class RescheduleRequest {
    @NotNull(message = "Yangi sana kiritilishi shart")
    private LocalDate newDate;

    @NotBlank(message = "Ko'chirish sababi kiritilishi shart")
    private String reason;
}
