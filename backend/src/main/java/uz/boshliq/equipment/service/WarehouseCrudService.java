package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.entity.*;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * TZ 4.2: Omborlar CRUD.
 */
@Service
@RequiredArgsConstructor
public class WarehouseCrudService {

    private final WarehouseRepository warehouseRepository;
    private final ResponsiblePersonRepository personRepository;

    public List<WarehouseDto> getAll() {
        return warehouseRepository.findAllByIsDeletedFalseAndIsActiveTrue()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public WarehouseDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public WarehouseDto create(WarehouseRequest req) {
        Warehouse wh = Warehouse.builder()
                .name(req.getName())
                .location(req.getLocation())
                .description(req.getDescription())
                .build();

        if (req.getResponsiblePersonId() != null) {
            wh.setResponsiblePerson(personRepository.findByIdAndIsDeletedFalse(req.getResponsiblePersonId())
                    .orElse(null));
        }
        return toDto(warehouseRepository.save(wh));
    }

    @Transactional
    public WarehouseDto update(Long id, WarehouseRequest req) {
        Warehouse wh = findOrThrow(id);
        wh.setName(req.getName());
        wh.setLocation(req.getLocation());
        wh.setDescription(req.getDescription());
        if (req.getResponsiblePersonId() != null) {
            wh.setResponsiblePerson(personRepository.findByIdAndIsDeletedFalse(req.getResponsiblePersonId()).orElse(null));
        }
        return toDto(warehouseRepository.save(wh));
    }

    @Transactional
    public void delete(Long id) {
        Warehouse wh = findOrThrow(id);
        wh.setIsDeleted(true);
        wh.setDeletedAt(LocalDateTime.now());
        warehouseRepository.save(wh);
    }

    private Warehouse findOrThrow(Long id) {
        return warehouseRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ombor topilmadi: " + id));
    }

    private WarehouseDto toDto(Warehouse w) {
        WarehouseDto d = new WarehouseDto();
        d.setId(w.getId());
        d.setName(w.getName());
        d.setLocation(w.getLocation());
        d.setDescription(w.getDescription());
        d.setIsActive(w.getIsActive());
        if (w.getResponsiblePerson() != null) {
            d.setResponsiblePersonId(w.getResponsiblePerson().getId());
            d.setResponsiblePersonName(w.getResponsiblePerson().getFullName());
        }
        return d;
    }

    @lombok.Data
    public static class WarehouseRequest {
        private String name;
        private String location;
        private String description;
        private Long responsiblePersonId;
    }

    @lombok.Data
    public static class WarehouseDto {
        private Long id;
        private String name;
        private String location;
        private String description;
        private Boolean isActive;
        private Long responsiblePersonId;
        private String responsiblePersonName;
    }
}
