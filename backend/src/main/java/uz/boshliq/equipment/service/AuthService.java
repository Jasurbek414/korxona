package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.dto.auth.AuthResponse;
import uz.boshliq.equipment.dto.auth.LoginRequest;
import uz.boshliq.equipment.dto.auth.RefreshTokenRequest;
import uz.boshliq.equipment.entity.User;
import uz.boshliq.equipment.exception.UnauthorizedException;
import uz.boshliq.equipment.repository.UserRepository;
import uz.boshliq.equipment.security.JwtService;

import java.time.LocalDateTime;

/**
 * Avtorizatsiya xizmati: login, refresh token, parol tiklash.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;

    /**
     * Login — username va parol bilan kirish
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameAndIsDeletedFalse(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Username yoki parol noto'g'ri"));

        // Foydalanuvchi bloklangan tekshiruv
        if (!user.getIsActive()) {
            throw new UnauthorizedException("Foydalanuvchi bloklangan");
        }

        // Vaqtinchalik bloklangan tekshiruv
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new UnauthorizedException("Hisob vaqtinchalik bloklangan. " +
                    LOCK_DURATION_MINUTES + " daqiqadan keyin qayta urinib ko'ring");
        }

        // Parol tekshiruv
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            handleFailedLogin(user);
            throw new UnauthorizedException("Username yoki parol noto'g'ri");
        }

        // Muvaffaqiyatli login — hisoblagichni nolga qaytarish
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        log.info("Foydalanuvchi tizimga kirdi: {}", user.getUsername());

        return buildAuthResponse(user);
    }

    /**
     * Refresh token orqali yangi access token olish
     */
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String username = jwtService.extractUsername(request.getRefreshToken());

        User user = userRepository.findByUsernameAndIsDeletedFalse(username)
                .orElseThrow(() -> new UnauthorizedException("Foydalanuvchi topilmadi"));

        if (!jwtService.isTokenValid(request.getRefreshToken(), username)) {
            throw new UnauthorizedException("Refresh token muddati o'tgan");
        }

        return buildAuthResponse(user);
    }

    /**
     * Noto'g'ri login urinishini qayta ishlash
     */
    private void handleFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);

        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
            log.warn("Foydalanuvchi bloklandi (5 marta noto'g'ri parol): {}", user.getUsername());
        }

        userRepository.save(user);
    }

    /**
     * Auth javobini yaratish
     */
    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .accessToken(jwtService.generateAccessToken(user))
                .refreshToken(jwtService.generateRefreshToken(user))
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .language(user.getLanguage().name())
                .build();
    }
}
