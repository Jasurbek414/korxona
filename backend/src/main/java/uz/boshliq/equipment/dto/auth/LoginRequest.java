package uz.boshliq.equipment.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Username kiritilishi shart")
    private String username;

    @NotBlank(message = "Parol kiritilishi shart")
    private String password;
}
