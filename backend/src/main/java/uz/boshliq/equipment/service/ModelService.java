package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.dto.ModelDto;
import uz.boshliq.equipment.entity.Manufacturer;
import uz.boshliq.equipment.entity.Model;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.ManufacturerRepository;
import uz.boshliq.equipment.repository.ModelRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModelService {

    private final ModelRepository repository;
    private final ManufacturerRepository manufacturerRepository;

    public List<ModelDto> getAll() {
        return repository.findAllByIsDeletedFalseOrderByNameAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ModelDto> getByManufacturer(Long manufacturerId) {
        return repository.findAllByManufacturerIdAndIsDeletedFalseOrderByNameAsc(manufacturerId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public ModelDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public ModelDto create(ModelDto dto) {
        Model entity = Model.builder().name(dto.getName()).build();
        if (dto.getManufacturerId() != null) {
            Manufacturer m = manufacturerRepository.findByIdAndIsDeletedFalse(dto.getManufacturerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ishlab chiqaruvchi topilmadi: " + dto.getManufacturerId()));
            entity.setManufacturer(m);
        }
        return toDto(repository.save(entity));
    }

    @Transactional
    public ModelDto update(Long id, ModelDto dto) {
        Model entity = findOrThrow(id);
        entity.setName(dto.getName());
        if (dto.getManufacturerId() != null) {
            Manufacturer m = manufacturerRepository.findByIdAndIsDeletedFalse(dto.getManufacturerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ishlab chiqaruvchi topilmadi: " + dto.getManufacturerId()));
            entity.setManufacturer(m);
        } else {
            entity.setManufacturer(null);
        }
        return toDto(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        Model entity = findOrThrow(id);
        entity.setIsDeleted(true);
        entity.setDeletedAt(LocalDateTime.now());
        repository.save(entity);
    }

    private Model findOrThrow(Long id) {
        return repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Model topilmadi: " + id));
    }

    private ModelDto toDto(Model e) {
        ModelDto dto = new ModelDto();
        dto.setId(e.getId());
        dto.setName(e.getName());
        if (e.getManufacturer() != null) {
            dto.setManufacturerId(e.getManufacturer().getId());
            dto.setManufacturerName(e.getManufacturer().getName());
        }
        return dto;
    }
}
