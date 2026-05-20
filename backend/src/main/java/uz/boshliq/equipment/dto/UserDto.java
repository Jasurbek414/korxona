package uz.boshliq.equipment.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserDto {
    private Long id;

    @NotBlank(message = "Username kiritilishi shart")
    @Size(min = 3, max = 50)
    private String username;

    @Size(min = 8, message = "Parol kamida 8 belgidan iborat bo'lishi kerak")
    private String password;

    @NotBlank(message = "F.I.O. kiritilishi shart")
    @Size(max = 150)
    private String fullName;

    @Email(message = "Email formati noto'g'ri")
    @Size(max = 100)
    private String email;

    @Size(max = 20)
    private String phone;

    @NotBlank(message = "Rol kiritilishi shart")
    private String role;

    private String language;
    private Boolean isActive;
    private String avatarPath;
}
