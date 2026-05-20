package uz.boshliq.equipment.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import uz.boshliq.equipment.dto.PageResponse;
import uz.boshliq.equipment.dto.ppr.*;
import uz.boshliq.equipment.entity.User;
import uz.boshliq.equipment.service.PprTaskService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * TZ 3.1-3.7: PPR vazifalari API.
 */
@RestController
@RequestMapping("/api/v1/ppr/tasks")
@RequiredArgsConstructor
public class PprTaskController {

    private final PprTaskService service;

    /** Vazifalar ro'yxati — filtrlar, paginatsiya */
    @GetMapping
    public ResponseEntity<PageResponse<PprTaskResponse>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long equipmentId,
            @RequestParam(required = false) Long assignedToId,
            @RequestParam(required = false) Long pprTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "scheduledDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(service.getAll(
                status, priority, equipmentId, assignedToId, pprTypeId,
                dateFrom, dateTo, sortBy, sortDir, page, size
        ));
    }

    /** Kalendar uchun — sana oralig'ida (TZ 3.1) */
    @GetMapping("/calendar")
    public ResponseEntity<List<PprTaskResponse>> getCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(service.getByDateRange(from, to));
    }

    /** Muddati o'tgan vazifalar (TZ 3.7) */
    @GetMapping("/overdue")
    public ResponseEntity<List<PprTaskResponse>> getOverdue() {
        return ResponseEntity.ok(service.getOverdue());
    }

    /** Bitta vazifa */
    @GetMapping("/{id}")
    public ResponseEntity<PprTaskResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /** Vazifa yaratish */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<PprTaskResponse> create(
            @Valid @RequestBody PprTaskRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, currentUser));
    }

    /** Vazifa tahrirlash */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<PprTaskResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody PprTaskRequest request
    ) {
        return ResponseEntity.ok(service.update(id, request));
    }

    /** Status o'zgartirish (TZ 3.4) */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<PprTaskResponse> changeStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(service.changeStatus(id, body.get("status"), body.get("completionNotes")));
    }

    /** Boshqa sanaga ko'chirish (TZ 3.5) */
    @PostMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<PprTaskResponse> reschedule(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(service.reschedule(id, request, currentUser));
    }

    /** Ko'chirish tarixi */
    @GetMapping("/{id}/reschedule-history")
    public ResponseEntity<List<PprTaskService.RescheduleHistoryResponse>> getRescheduleHistory(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRescheduleHistory(id));
    }

    /** O'chirish */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
