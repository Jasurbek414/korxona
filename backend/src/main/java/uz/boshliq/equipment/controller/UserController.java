package uz.boshliq.equipment.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import uz.boshliq.equipment.dto.ChangePasswordDto;
import uz.boshliq.equipment.dto.ProfileUpdateDto;
import uz.boshliq.equipment.dto.UserDto;
import uz.boshliq.equipment.entity.User;
import uz.boshliq.equipment.service.UserService;

import java.util.List;
import java.util.Map;

/**
 * Foydalanuvchilar boshqaruvi va profil API.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    // ==================== ADMIN: Foydalanuvchilar boshqaruvi ====================

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> create(@Valid @RequestBody UserDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> update(@PathVariable Long id, @Valid @RequestBody UserDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Foydalanuvchini bloklash/aktivlashtirish */
    @PatchMapping("/users/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> toggleActive(@PathVariable Long id) {
        service.toggleActive(id);
        return ResponseEntity.ok("Foydalanuvchi holati o'zgartirildi");
    }

    /** Admin tomonidan parolni majburiy tiklash */
    @PatchMapping("/users/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        service.resetPassword(id, body.get("newPassword"));
        return ResponseEntity.ok("Parol muvaffaqiyatli tiklandi");
    }

    // ==================== PROFIL: O'z profilim ====================

    /** Joriy foydalanuvchi profilini ko'rish */
    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(service.getById(currentUser.getId()));
    }

    /** Joriy foydalanuvchi profilini tahrirlash */
    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ProfileUpdateDto dto) {
        return ResponseEntity.ok(service.updateProfile(currentUser, dto));
    }

    /** Parolni o'zgartirish (eski parolni kiritish shart) */
    @PutMapping("/profile/change-password")
    public ResponseEntity<String> changePassword(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ChangePasswordDto dto) {
        service.changePassword(currentUser, dto);
        return ResponseEntity.ok("Parol muvaffaqiyatli o'zgartirildi");
    }
}
