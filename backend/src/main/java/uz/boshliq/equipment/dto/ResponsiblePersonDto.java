package uz.boshliq.equipment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResponsiblePersonDto {
    private Long id;

    @NotBlank(message = "F.I.O. kiritilishi shart")
    @Size(max = 150)
    private String fullName;

    @Size(max = 100)
    private String position;

    @Size(max = 20)
    private String phone;

    @Size(max = 100)
    private String email;
}
