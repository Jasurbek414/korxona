package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * TZ 5.5: Ma'lumotlar bazasi zaxira nusxa xizmati.
 * Kunlik avtomatik backup, fayllarni saqlash va eski nusxalarni tozalash.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BackupService {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${app.backup.dir:./backups}")
    private String backupDir;

    @Value("${app.backup.retention-days:30}")
    private int retentionDays;

    @Value("${app.backup.enabled:true}")
    private boolean backupEnabled;

    private final List<BackupRecord> backupHistory = new ArrayList<>();

    /**
     * Kunlik avtomatik zaxira nusxa (TZ 5.5).
     * Har kuni 02:00 da ishlaydi.
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void scheduledBackup() {
        if (!backupEnabled) {
            log.info("Backup o'chirilgan — o'tkazib yuborildi");
            return;
        }
        createBackup("scheduled");
    }

    /**
     * Qo'lda zaxira nusxa yaratish.
     */
    public BackupRecord createBackup(String trigger) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String fileName = "backup_" + timestamp + ".sql";
        String filePath = backupDir + File.separator + fileName;

        // Papkani yaratish
        File dir = new File(backupDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        BackupRecord record = new BackupRecord();
        record.setFileName(fileName);
        record.setFilePath(filePath);
        record.setCreatedAt(LocalDateTime.now());
        record.setTrigger(trigger);

        try {
            // Database nomi
            String dbName = extractDbName(dbUrl);

            // pg_dump buyrug'i
            ProcessBuilder pb = new ProcessBuilder(
                    "pg_dump",
                    "-h", extractHost(dbUrl),
                    "-p", extractPort(dbUrl),
                    "-U", dbUsername,
                    "-d", dbName,
                    "-f", filePath,
                    "--no-owner",
                    "--no-privileges"
            );
            pb.environment().put("PGPASSWORD", dbPassword);
            pb.redirectErrorStream(true);

            Process process = pb.start();
            int exitCode = process.waitFor();

            if (exitCode == 0) {
                File backupFile = new File(filePath);
                record.setFileSize(backupFile.length());
                record.setStatus("SUCCESS");
                log.info("Backup muvaffaqiyatli: {} ({} KB)", fileName, backupFile.length() / 1024);
            } else {
                // pg_dump mavjud bo'lmasa, SQL export qilamiz
                record.setStatus("FALLBACK");
                record.setNotes("pg_dump mavjud emas, metadata saqlandi");
                saveFallbackBackup(filePath);
                log.warn("pg_dump ishlamadi, fallback backup yaratildi: {}", fileName);
            }
        } catch (Exception e) {
            record.setStatus("ERROR");
            record.setNotes(e.getMessage());
            log.error("Backup xatosi: {}", e.getMessage());
        }

        backupHistory.add(0, record);

        // Eski nusxalarni tozalash
        cleanOldBackups();

        return record;
    }

    /**
     * Barcha zaxira nusxalar tarixi.
     */
    public List<BackupRecord> getBackupHistory() {
        // Diskdan ham tekshirish
        File dir = new File(backupDir);
        if (dir.exists() && backupHistory.isEmpty()) {
            File[] files = dir.listFiles((d, name) -> name.startsWith("backup_") && name.endsWith(".sql"));
            if (files != null) {
                for (File f : files) {
                    BackupRecord r = new BackupRecord();
                    r.setFileName(f.getName());
                    r.setFilePath(f.getAbsolutePath());
                    r.setFileSize(f.length());
                    r.setStatus("SUCCESS");
                    r.setCreatedAt(LocalDateTime.now()); // Approx
                    backupHistory.add(r);
                }
            }
        }
        return backupHistory;
    }

    /**
     * Eski backuplarni tozalash.
     */
    private void cleanOldBackups() {
        File dir = new File(backupDir);
        if (!dir.exists()) return;

        long cutoff = System.currentTimeMillis() - ((long) retentionDays * 24 * 60 * 60 * 1000);
        File[] files = dir.listFiles((d, name) -> name.startsWith("backup_") && name.endsWith(".sql"));
        if (files != null) {
            for (File f : files) {
                if (f.lastModified() < cutoff) {
                    if (f.delete()) {
                        log.info("Eski backup o'chirildi: {}", f.getName());
                    }
                }
            }
        }
    }

    private void saveFallbackBackup(String filePath) throws IOException {
        try (PrintWriter pw = new PrintWriter(new FileWriter(filePath))) {
            pw.println("-- Equipment Management System Backup");
            pw.println("-- Generated: " + LocalDateTime.now());
            pw.println("-- Database: " + dbUrl);
            pw.println("-- Note: pg_dump mavjud emas, bu metadata backup");
            pw.println("-- Production muhitda pg_dump o'rnatilishi shart");
        }
    }

    // URL parsing
    private String extractDbName(String url) {
        return url.substring(url.lastIndexOf('/') + 1).split("\\?")[0];
    }

    private String extractHost(String url) {
        String s = url.replace("jdbc:postgresql://", "");
        return s.split(":")[0];
    }

    private String extractPort(String url) {
        String s = url.replace("jdbc:postgresql://", "");
        String portAndDb = s.split(":").length > 1 ? s.split(":")[1] : "5432";
        return portAndDb.split("/")[0];
    }

    // DTO
    @lombok.Data
    public static class BackupRecord {
        private String fileName;
        private String filePath;
        private long fileSize;
        private String status;  // SUCCESS, ERROR, FALLBACK
        private String trigger; // scheduled, manual
        private String notes;
        private LocalDateTime createdAt;
    }
}
