package uz.boshliq.equipment.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import uz.boshliq.equipment.dto.PageResponse;
import uz.boshliq.equipment.dto.equipment.EquipmentRequest;
import uz.boshliq.equipment.dto.equipment.EquipmentResponse;
import uz.boshliq.equipment.dto.equipment.StatusHistoryResponse;
import uz.boshliq.equipment.entity.User;
import uz.boshliq.equipment.service.EquipmentService;

import java.util.List;

/**
 * Uskunalar API — TZ 2.8-2.13
 */
@RestController
@RequestMapping("/api/v1/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService service;

    /**
     * GET /api/v1/equipment — Uskunalar ro'yxati (filtr, qidiruv, paginatsiya)
     */
    @GetMapping
    public ResponseEntity<PageResponse<EquipmentResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long statusId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) Long responsiblePersonId,
            @RequestParam(required = false) Long manufacturerId,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(service.getAll(
                search, categoryId, statusId, locationId,
                responsiblePersonId, manufacturerId, sortBy, sortDir, page, size
        ));
    }

    /**
     * GET /api/v1/equipment/{id} — Uskuna kartochkasi
     */
    @GetMapping("/{id}")
    public ResponseEntity<EquipmentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * POST /api/v1/equipment — Yangi uskuna yaratish
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<EquipmentResponse> create(
            @Valid @RequestBody EquipmentRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, currentUser));
    }

    /**
     * PUT /api/v1/equipment/{id} — Uskuna tahrirlash
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<EquipmentResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(service.update(id, request, currentUser));
    }

    /**
     * DELETE /api/v1/equipment/{id} — Uskuna o'chirish (soft delete)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/v1/equipment/{id}/status-history — Status o'zgarish tarixi
     */
    @GetMapping("/{id}/status-history")
    public ResponseEntity<List<StatusHistoryResponse>> getStatusHistory(@PathVariable Long id) {
        return ResponseEntity.ok(service.getStatusHistory(id));
    }
}
