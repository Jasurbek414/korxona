package uz.boshliq.equipment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uz.boshliq.equipment.entity.PprType;
import uz.boshliq.equipment.service.PprTypeService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ppr-types")
@RequiredArgsConstructor
public class PprTypeController {
    private final PprTypeService service;

    @GetMapping
    public ResponseEntity<List<PprType>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PprType> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PprType> create(@RequestBody PprType pprType) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(pprType));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PprType> update(@PathVariable Long id, @RequestBody PprType pprType) {
        return ResponseEntity.ok(service.update(id, pprType));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
