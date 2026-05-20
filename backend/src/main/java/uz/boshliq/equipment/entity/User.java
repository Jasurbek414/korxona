package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;
import uz.boshliq.equipment.enums.Language;
import uz.boshliq.equipment.enums.UserRole;

/**
 * Foydalanuvchi entity.
 * Tizimga kirish, rol va profil ma'lumotlarini saqlaydi.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "language", nullable = false, length = 5)
    @Builder.Default
    private Language language = Language.UZ;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "failed_login_attempts", nullable = false)
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    @Column(name = "locked_until")
    private java.time.LocalDateTime lockedUntil;

    @Column(name = "avatar_path")
    private String avatarPath;

    @Column(name = "password_reset_token")
    private String passwordResetToken;

    @Column(name = "password_reset_expires")
    private java.time.LocalDateTime passwordResetExpires;
}
