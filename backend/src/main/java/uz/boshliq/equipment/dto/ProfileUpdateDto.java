package uz.boshliq.equipment.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Foydalanuvchi o'z profilini tahrirlash uchun DTO.
 */
@Data
public class ProfileUpdateDto {
    @Size(max = 150)
    private String fullName;

    @Email(message = "Email formati noto'g'ri")
    @Size(max = 100)
    private String email;

    @Size(max = 20)
    private String phone;

    private String language;
}
