package uz.boshliq.equipment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ManufacturerDto {
    private Long id;

    @NotBlank(message = "Ishlab chiqaruvchi nomi kiritilishi shart")
    @Size(max = 100)
    private String name;

    @Size(max = 100)
    private String country;
}
