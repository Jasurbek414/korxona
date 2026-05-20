package uz.boshliq.equipment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StatusDto {
    private Long id;

    @NotBlank(message = "Status nomi (uz) kiritilishi shart")
    @Size(max = 50)
    private String nameUz;

    @Size(max = 50)
    private String nameRu;

    @Size(max = 20)
    private String color;

    @Size(max = 300)
    private String description;
}
