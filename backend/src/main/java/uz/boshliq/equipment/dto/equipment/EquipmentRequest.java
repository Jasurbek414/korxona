package uz.boshliq.equipment.dto.equipment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Uskuna yaratish/tahrirlash uchun DTO (so'rov).
 */
@Data
public class EquipmentRequest {
    @NotBlank(message = "Inventar raqami kiritilishi shart")
    @Size(max = 50)
    private String inventoryNumber;

    @NotBlank(message = "Uskuna nomi kiritilishi shart")
    @Size(max = 200)
    private String name;

    @NotNull(message = "Toifa tanlanishi shart")
    private Long categoryId;

    private Long manufacturerId;
    private Long modelId;

    @Size(max = 100)
    private String serialNumber;

    @NotNull(message = "Status tanlanishi shart")
    private Long statusId;

    @NotNull(message = "Joylashuv tanlanishi shart")
    private Long locationId;

    @NotNull(message = "Mas'ul shaxs tanlanishi shart")
    private Long responsiblePersonId;

    private LocalDate commissionedDate;
    private LocalDate warrantyDate;
    private BigDecimal purchasePrice;

    @Size(max = 2000)
    private String notes;
}
