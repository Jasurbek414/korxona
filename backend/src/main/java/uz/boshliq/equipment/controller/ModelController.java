package uz.boshliq.equipment.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uz.boshliq.equipment.dto.ModelDto;
import uz.boshliq.equipment.service.ModelService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/models")
@RequiredArgsConstructor
public class ModelController {

    private final ModelService service;

    @GetMapping
    public ResponseEntity<List<ModelDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    /** Ishlab chiqaruvchi bo'yicha modellarni olish */
    @GetMapping("/by-manufacturer/{manufacturerId}")
    public ResponseEntity<List<ModelDto>> getByManufacturer(@PathVariable Long manufacturerId) {
        return ResponseEntity.ok(service.getByManufacturer(manufacturerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModelDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ModelDto> create(@Valid @RequestBody ModelDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ModelDto> update(@PathVariable Long id, @Valid @RequestBody ModelDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
