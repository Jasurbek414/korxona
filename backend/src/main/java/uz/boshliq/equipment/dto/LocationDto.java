package uz.boshliq.equipment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LocationDto {
    private Long id;

    @NotBlank(message = "Joylashuv nomi kiritilishi shart")
    @Size(max = 150)
    private String name;

    @Size(max = 100)
    private String building;

    @Size(max = 20)
    private String floor;

    @Size(max = 50)
    private String room;
}
