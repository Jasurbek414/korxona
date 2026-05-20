package uz.boshliq.equipment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DocumentTypeDto {
    private Long id;

    @NotBlank(message = "Hujjat turi nomi (uz) kiritilishi shart")
    @Size(max = 100)
    private String nameUz;

    @Size(max = 100)
    private String nameRu;
}
