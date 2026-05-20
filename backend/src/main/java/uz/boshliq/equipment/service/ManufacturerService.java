package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.dto.ManufacturerDto;
import uz.boshliq.equipment.entity.Manufacturer;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.ManufacturerRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManufacturerService {

    private final ManufacturerRepository repository;

    public List<ManufacturerDto> getAll() {
        return repository.findAllByIsDeletedFalseOrderByNameAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public ManufacturerDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public ManufacturerDto create(ManufacturerDto dto) {
        Manufacturer entity = Manufacturer.builder()
                .name(dto.getName()).country(dto.getCountry()).build();
        return toDto(repository.save(entity));
    }

    @Transactional
    public ManufacturerDto update(Long id, ManufacturerDto dto) {
        Manufacturer entity = findOrThrow(id);
        entity.setName(dto.getName());
        entity.setCountry(dto.getCountry());
        return toDto(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        Manufacturer entity = findOrThrow(id);
        entity.setIsDeleted(true);
        entity.setDeletedAt(LocalDateTime.now());
        repository.save(entity);
    }

    private Manufacturer findOrThrow(Long id) {
        return repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ishlab chiqaruvchi topilmadi: " + id));
    }

    private ManufacturerDto toDto(Manufacturer e) {
        ManufacturerDto dto = new ManufacturerDto();
        dto.setId(e.getId());
        dto.setName(e.getName());
        dto.setCountry(e.getCountry());
        return dto;
    }
}
