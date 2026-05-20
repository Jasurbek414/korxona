package uz.boshliq.equipment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Parol o'zgartirish uchun DTO.
 */
@Data
public class ChangePasswordDto {
    @NotBlank(message = "Eski parol kiritilishi shart")
    private String oldPassword;

    @NotBlank(message = "Yangi parol kiritilishi shart")
    @Size(min = 8, message = "Parol kamida 8 belgidan iborat bo'lishi kerak")
    private String newPassword;
}
