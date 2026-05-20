package uz.boshliq.equipment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uz.boshliq.equipment.service.BackupService;

import java.util.List;

/**
 * TZ 5.5: Zaxira nusxalash API.
 */
@RestController
@RequestMapping("/api/v1/backup")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class BackupController {

    private final BackupService backupService;

    /** Qo'lda backup yaratish */
    @PostMapping
    public ResponseEntity<BackupService.BackupRecord> createBackup() {
        return ResponseEntity.ok(backupService.createBackup("manual"));
    }

    /** Backup tarixi */
    @GetMapping
    public ResponseEntity<List<BackupService.BackupRecord>> getHistory() {
        return ResponseEntity.ok(backupService.getBackupHistory());
    }
}
