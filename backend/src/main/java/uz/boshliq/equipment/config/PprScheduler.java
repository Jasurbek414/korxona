package uz.boshliq.equipment.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uz.boshliq.equipment.service.ServiceIntervalService;

/**
 * TZ 3.3: Har kuni ertalab 06:00 da avtomatik PPR vazifalarni tekshirish va yaratish.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PprScheduler {

    private final ServiceIntervalService service;

    /**
     * Har kuni 06:00 da ishga tushadi.
     * Muddati yetgan intervallar uchun yangi vazifalarni avtomatik yaratadi.
     */
    @Scheduled(cron = "0 0 6 * * *")
    public void dailyTaskGeneration() {
        log.info("=== PPR avtomatik vazifa yaratish boshlandi ===");
        try {
            int count = service.generateScheduledTasks();
            log.info("=== PPR: {} ta vazifa yaratildi ===", count);
        } catch (Exception e) {
            log.error("PPR scheduler xatosi: {}", e.getMessage(), e);
        }
    }
}
