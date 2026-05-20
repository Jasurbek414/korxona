package uz.boshliq.equipment.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.boshliq.equipment.dto.auth.AuthResponse;
import uz.boshliq.equipment.dto.auth.LoginRequest;
import uz.boshliq.equipment.dto.auth.RefreshTokenRequest;
import uz.boshliq.equipment.service.AuthService;

/**
 * Avtorizatsiya API — login, refresh, logout
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/v1/auth/login — Tizimga kirish
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * POST /api/v1/auth/refresh — Tokenni yangilash
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    /**
     * POST /api/v1/auth/logout — Tizimdan chiqish
     * (JWT stateless — client tomonida token o'chiriladi)
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Tizimdan muvaffaqiyatli chiqdingiz");
    }
}

