package uz.boshliq.equipment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uz.boshliq.equipment.entity.MeasurementUnit;
import uz.boshliq.equipment.entity.SparePartCategory;
import uz.boshliq.equipment.service.SparePartService;

import java.util.List;

/**
 * TZ 4.1: Ehtiyot qismlar katalogi API.
 */
@RestController
@RequestMapping("/api/v1/spare-parts")
@RequiredArgsConstructor
public class SparePartController {

    private final SparePartService service;

    @GetMapping
    public ResponseEntity<List<SparePartService.SparePartDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SparePartService.SparePartDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/by-code/{code}")
    public ResponseEntity<SparePartService.SparePartDto> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(service.getByCode(code));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<SparePartService.SparePartDto> create(@RequestBody SparePartService.SparePartRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<SparePartService.SparePartDto> update(@PathVariable Long id,
                                                                 @RequestBody SparePartService.SparePartRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categories")
    public ResponseEntity<List<SparePartCategory>> getCategories() {
        return ResponseEntity.ok(service.getCategories());
    }

    @GetMapping("/units")
    public ResponseEntity<List<MeasurementUnit>> getUnits() {
        return ResponseEntity.ok(service.getUnits());
    }
}
