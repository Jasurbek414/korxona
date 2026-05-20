package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.dto.ChangePasswordDto;
import uz.boshliq.equipment.dto.ProfileUpdateDto;
import uz.boshliq.equipment.dto.UserDto;
import uz.boshliq.equipment.entity.User;
import uz.boshliq.equipment.enums.Language;
import uz.boshliq.equipment.enums.UserRole;
import uz.boshliq.equipment.exception.BadRequestException;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /** Barcha foydalanuvchilar ro'yxati (Admin uchun) */
    public List<UserDto> getAll() {
        return userRepository.findAll().stream()
                .filter(u -> !u.getIsDeleted())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public UserDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    /** Admin tomonidan yangi foydalanuvchi yaratish */
    @Transactional
    public UserDto create(UserDto dto) {
        if (userRepository.existsByUsernameAndIsDeletedFalse(dto.getUsername())) {
            throw new BadRequestException("Bu username allaqachon mavjud: " + dto.getUsername());
        }
        if (dto.getEmail() != null && userRepository.existsByEmailAndIsDeletedFalse(dto.getEmail())) {
            throw new BadRequestException("Bu email allaqachon mavjud: " + dto.getEmail());
        }
        if (dto.getPassword() == null || dto.getPassword().length() < 8) {
            throw new BadRequestException("Parol kamida 8 belgidan iborat bo'lishi kerak");
        }

        User user = User.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .role(UserRole.valueOf(dto.getRole()))
                .language(dto.getLanguage() != null ? Language.valueOf(dto.getLanguage()) : Language.UZ)
                .isActive(true)
                .build();
        log.info("Yangi foydalanuvchi yaratildi: {}", dto.getUsername());
        return toDto(userRepository.save(user));
    }

    /** Admin tomonidan foydalanuvchini tahrirlash */
    @Transactional
    public UserDto update(Long id, UserDto dto) {
        User user = findOrThrow(id);
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setRole(UserRole.valueOf(dto.getRole()));
        if (dto.getLanguage() != null) {
            user.setLanguage(Language.valueOf(dto.getLanguage()));
        }
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        return toDto(userRepository.save(user));
    }

    /** Foydalanuvchini bloklash/aktivlashtirish */
    @Transactional
    public void toggleActive(Long id) {
        User user = findOrThrow(id);
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
        log.info("Foydalanuvchi {} — isActive: {}", user.getUsername(), user.getIsActive());
    }

    /** Admin tomonidan parolni majburiy tiklash */
    @Transactional
    public void resetPassword(Long id, String newPassword) {
        if (newPassword == null || newPassword.length() < 8) {
            throw new BadRequestException("Parol kamida 8 belgidan iborat bo'lishi kerak");
        }
        User user = findOrThrow(id);
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        log.info("Foydalanuvchi parol tiklandi: {}", user.getUsername());
    }

    /** Foydalanuvchi o'z profilini tahrirlash */
    @Transactional
    public UserDto updateProfile(User currentUser, ProfileUpdateDto dto) {
        if (dto.getFullName() != null) currentUser.setFullName(dto.getFullName());
        if (dto.getEmail() != null) currentUser.setEmail(dto.getEmail());
        if (dto.getPhone() != null) currentUser.setPhone(dto.getPhone());
        if (dto.getLanguage() != null) currentUser.setLanguage(Language.valueOf(dto.getLanguage()));
        return toDto(userRepository.save(currentUser));
    }

    /** Foydalanuvchi o'z parolini o'zgartirish */
    @Transactional
    public void changePassword(User currentUser, ChangePasswordDto dto) {
        if (!passwordEncoder.matches(dto.getOldPassword(), currentUser.getPassword())) {
            throw new BadRequestException("Eski parol noto'g'ri");
        }
        currentUser.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(currentUser);
        log.info("Foydalanuvchi parolni o'zgartirdi: {}", currentUser.getUsername());
    }

    /** Soft delete */
    @Transactional
    public void delete(Long id) {
        User user = findOrThrow(id);
        user.setIsDeleted(true);
        user.setDeletedAt(LocalDateTime.now());
        user.setIsActive(false);
        userRepository.save(user);
    }

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .filter(u -> !u.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Foydalanuvchi topilmadi: " + id));
    }

    private UserDto toDto(User u) {
        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setFullName(u.getFullName());
        dto.setEmail(u.getEmail());
        dto.setPhone(u.getPhone());
        dto.setRole(u.getRole().name());
        dto.setLanguage(u.getLanguage().name());
        dto.setIsActive(u.getIsActive());
        dto.setAvatarPath(u.getAvatarPath());
        // Parolni hech qachon qaytarmaymiz
        return dto;
    }
}
