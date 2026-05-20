package uz.boshliq.equipment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uz.boshliq.equipment.dto.PageResponse;
import uz.boshliq.equipment.service.AuditLogService;

/**
 * TZ 5.4: Audit jurnali API.
 * Faqat administrator ko'rishi mumkin.
 */
@RestController
@RequestMapping("/api/v1/audit-log")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<PageResponse<AuditLogService.AuditLogResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(auditLogService.getAll(page, size));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<PageResponse<AuditLogService.AuditLogResponse>> getByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(auditLogService.getByUser(userId, page, size));
    }

    @GetMapping("/by-action/{action}")
    public ResponseEntity<PageResponse<AuditLogService.AuditLogResponse>> getByAction(
            @PathVariable String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(auditLogService.getByAction(action, page, size));
    }
}
