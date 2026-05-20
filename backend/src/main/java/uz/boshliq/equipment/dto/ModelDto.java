package uz.boshliq.equipment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ModelDto {
    private Long id;

    @NotBlank(message = "Model nomi kiritilishi shart")
    @Size(max = 150)
    private String name;

    private Long manufacturerId;
    private String manufacturerName;
}
