package uz.boshliq.equipment.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uz.boshliq.equipment.dto.ResponsiblePersonDto;
import uz.boshliq.equipment.service.ResponsiblePersonService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/responsible-persons")
@RequiredArgsConstructor
public class ResponsiblePersonController {

    private final ResponsiblePersonService service;

    @GetMapping
    public ResponseEntity<List<ResponsiblePersonDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponsiblePersonDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponsiblePersonDto> create(@Valid @RequestBody ResponsiblePersonDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponsiblePersonDto> update(@PathVariable Long id, @Valid @RequestBody ResponsiblePersonDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
