package uz.boshliq.equipment.dto.equipment;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Uskuna javob DTO si (ro'yxat va kartochka uchun).
 */
@Data
public class EquipmentResponse {
    private Long id;
    private String inventoryNumber;
    private String name;

    // Toifa
    private Long categoryId;
    private String categoryName;

    // Ishlab chiqaruvchi
    private Long manufacturerId;
    private String manufacturerName;

    // Model
    private Long modelId;
    private String modelName;

    private String serialNumber;

    // Status
    private Long statusId;
    private String statusName;
    private String statusColor;

    // Joylashuv
    private Long locationId;
    private String locationName;

    // Mas'ul shaxs
    private Long responsiblePersonId;
    private String responsiblePersonName;

    private LocalDate commissionedDate;
    private LocalDate warrantyDate;
    private BigDecimal purchasePrice;
    private String notes;
    private String qrCodePath;

    // Meta ma'lumotlar
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdByName;
}
