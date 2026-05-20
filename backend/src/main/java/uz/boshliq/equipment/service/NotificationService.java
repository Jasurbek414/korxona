package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import uz.boshliq.equipment.entity.*;
import uz.boshliq.equipment.repository.*;

import java.time.LocalDate;
import java.util.List;

/**
 * TZ 5.3: Xabarnomalar xizmati — Telegram va tizim ichki ogohlantirishlari.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final PprTaskRepository taskRepository;
    private final WarehouseStockRepository stockRepository;

    @Value("${app.telegram.bot-token:}")
    private String botToken;

    @Value("${app.telegram.chat-id:}")
    private String chatId;

    @Value("${app.notification.overdue-enabled:true}")
    private boolean overdueEnabled;

    @Value("${app.notification.low-stock-enabled:true}")
    private boolean lowStockEnabled;

    @Value("${app.notification.days-before-due:3}")
    private int daysBeforeDue;

    private final RestTemplate restTemplate = new RestTemplate();

    // ======================== 1. Muddati yaqinlashgan vazifalar (TZ 5.3.1) ========================

    @Scheduled(cron = "0 0 7 * * *") // Har kuni 07:00
    public void notifyUpcomingTasks() {
        if (!overdueEnabled) return;

        LocalDate warningDate = LocalDate.now().plusDays(daysBeforeDue);
        List<PprTask> upcoming = taskRepository
                .findAllByScheduledDateBetweenAndIsDeletedFalse(LocalDate.now(), warningDate);

        List<PprTask> scheduled = upcoming.stream()
                .filter(t -> t.getStatus() == PprTask.TaskStatus.SCHEDULED)
                .toList();

        if (scheduled.isEmpty()) return;

        StringBuilder message = new StringBuilder();
        message.append("📋 *Yaqinlashgan PPR vazifalari*\n");
        message.append("_Keyingi ").append(daysBeforeDue).append(" kun ichida_\n\n");

        for (PprTask task : scheduled) {
            message.append("▫️ *").append(task.getTaskNumber()).append("*");
            if (task.getEquipment() != null) {
                message.append(" — ").append(task.getEquipment().getName());
            }
            message.append("\n  📅 ").append(task.getScheduledDate());
            if (task.getAssignedTo() != null) {
                message.append(" | 👤 ").append(task.getAssignedTo().getFullName());
            }
            message.append("\n");
        }

        message.append("\nJami: *").append(scheduled.size()).append("* ta vazifa");
        sendTelegramMessage(message.toString());
        log.info("Xabarnoma: {} ta yaqinlashgan vazifa haqida yuborildi", scheduled.size());
    }

    // ======================== 2. Muddati o'tgan vazifalar (TZ 5.3.2) ========================

    @Scheduled(cron = "0 30 7 * * *") // Har kuni 07:30
    public void notifyOverdueTasks() {
        if (!overdueEnabled) return;

        List<PprTask> overdue = taskRepository
                .findAllByScheduledDateBeforeAndStatusAndIsDeletedFalse(LocalDate.now(), PprTask.TaskStatus.SCHEDULED);

        if (overdue.isEmpty()) return;

        StringBuilder message = new StringBuilder();
        message.append("🚨 *Muddati o'tgan vazifalar!*\n\n");

        for (PprTask task : overdue) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(task.getScheduledDate(), LocalDate.now());
            message.append("🔴 *").append(task.getTaskNumber()).append("*");
            if (task.getEquipment() != null) {
                message.append(" — ").append(task.getEquipment().getName());
            }
            message.append("\n  ⏰ ").append(days).append(" kun kechikkan");
            message.append("\n");
        }

        message.append("\nJami: *").append(overdue.size()).append("* ta kechikkan vazifa");
        sendTelegramMessage(message.toString());
        log.info("Xabarnoma: {} ta muddati o'tgan vazifa haqida yuborildi", overdue.size());
    }

    // ======================== 3. Minimal qoldiq ogohlantirish (TZ 5.3.3) ========================

    @Scheduled(cron = "0 0 8 * * *") // Har kuni 08:00
    public void notifyLowStock() {
        if (!lowStockEnabled) return;

        List<WarehouseStock> lowStock = stockRepository.findLowStockItems();
        if (lowStock.isEmpty()) return;

        StringBuilder message = new StringBuilder();
        message.append("⚠️ *Ombor ogohlantirishi*\n");
        message.append("_Minimal qoldiqdan past ehtiyot qismlar_\n\n");

        for (WarehouseStock stock : lowStock) {
            message.append("📦 *").append(stock.getSparePart().getName()).append("*");
            message.append(" (").append(stock.getSparePart().getCode()).append(")");
            message.append("\n  🏪 ").append(stock.getWarehouse().getName());
            message.append(" | Qoldiq: *").append(stock.getQuantity()).append("*");
            message.append(" / Min: ").append(stock.getSparePart().getMinStock());
            message.append("\n");
        }

        message.append("\nJami: *").append(lowStock.size()).append("* ta ehtiyot qism");
        sendTelegramMessage(message.toString());
        log.info("Xabarnoma: {} ta kam qoldiq haqida yuborildi", lowStock.size());
    }

    // ======================== Qo'lda xabarnoma ========================

    public void sendCustomNotification(String title, String body) {
        String message = "📢 *" + title + "*\n\n" + body;
        sendTelegramMessage(message);
    }

    // ======================== Telegram API ========================

    private void sendTelegramMessage(String text) {
        if (botToken.isBlank() || chatId.isBlank()) {
            log.debug("Telegram sozlanmagan — xabarnoma log ga yozildi: {}", text);
            return;
        }

        try {
            String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
            var body = java.util.Map.of(
                    "chat_id", chatId,
                    "text", text,
                    "parse_mode", "Markdown"
            );
            restTemplate.postForEntity(url, body, String.class);
            log.info("Telegram xabarnoma yuborildi");
        } catch (Exception e) {
            log.error("Telegram xabarnoma yuborishda xato: {}", e.getMessage());
        }
    }
}
