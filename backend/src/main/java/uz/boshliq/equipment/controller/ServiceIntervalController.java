package uz.boshliq.equipment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uz.boshliq.equipment.service.ServiceIntervalService;

import java.util.List;
import java.util.Map;

/**
 * TZ 3.2: Xizmat ko'rsatish intervallari API.
 */
@RestController
@RequestMapping("/api/v1/ppr/intervals")
@RequiredArgsConstructor
public class ServiceIntervalController {

    private final ServiceIntervalService service;

    @GetMapping
    public ResponseEntity<List<ServiceIntervalService.IntervalResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<ServiceIntervalService.IntervalResponse>> getByEquipment(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(service.getByEquipment(equipmentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceIntervalService.IntervalResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<ServiceIntervalService.IntervalResponse> create(
            @RequestBody ServiceIntervalService.IntervalRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<ServiceIntervalService.IntervalResponse> update(
            @PathVariable Long id,
            @RequestBody ServiceIntervalService.IntervalRequest request
    ) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Qo'lda avtomatik yaratishni chaqirish (test uchun) */
    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Integer>> generateTasks() {
        int count = service.generateScheduledTasks();
        return ResponseEntity.ok(Map.of("generatedTasks", count));
    }
}
