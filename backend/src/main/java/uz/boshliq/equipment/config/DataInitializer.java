package uz.boshliq.equipment.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import uz.boshliq.equipment.entity.User;
import uz.boshliq.equipment.enums.Language;
import uz.boshliq.equipment.enums.UserRole;
import uz.boshliq.equipment.repository.UserRepository;

/**
 * Dev profili uchun boshlang'ich ma'lumotlar.
 * Faqat "dev" profilida ishlaydi.
 */
@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info(">>> Dev profili: boshlang'ich foydalanuvchilar yaratilmoqda...");

            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("Admin123!"))
                    .fullName("Adminov Admin")
                    .email("admin@boshliq.uz")
                    .phone("+998901234567")
                    .role(UserRole.ADMIN)
                    .language(Language.UZ)
                    .isActive(true)
                    .build();
            userRepository.save(admin);

            User operator = User.builder()
                    .username("operator1")
                    .password(passwordEncoder.encode("Admin123!"))
                    .fullName("Karimov Jasur")
                    .email("jasur@boshliq.uz")
                    .phone("+998901234568")
                    .role(UserRole.OPERATOR)
                    .language(Language.UZ)
                    .isActive(true)
                    .build();
            userRepository.save(operator);

            log.info(">>> Admin: admin / Admin123!");
            log.info(">>> Operator: operator1 / Admin123!");
        } else {
            log.info(">>> Dev: Foydalanuvchilar allaqachon mavjud ({} ta)", userRepository.count());
        }
    }
}
