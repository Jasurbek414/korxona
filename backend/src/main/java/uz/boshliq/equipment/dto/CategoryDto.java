package uz.boshliq.equipment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Toifa yaratish/tahrirlash uchun DTO.
 */
@Data
public class CategoryDto {
    private Long id;

    @NotBlank(message = "Toifa nomi (uz) kiritilishi shart")
    @Size(max = 100, message = "Toifa nomi 100 belgidan oshmasligi kerak")
    private String nameUz;

    @Size(max = 100, message = "Toifa nomi (ru) 100 belgidan oshmasligi kerak")
    private String nameRu;

    @Size(max = 500, message = "Tavsif 500 belgidan oshmasligi kerak")
    private String description;
}
