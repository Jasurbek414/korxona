package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.dto.StatusDto;
import uz.boshliq.equipment.entity.Status;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.StatusRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatusService {

    private final StatusRepository repository;

    public List<StatusDto> getAll() {
        return repository.findAllByIsDeletedFalseOrderByNameUzAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public StatusDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public StatusDto create(StatusDto dto) {
        Status entity = Status.builder()
                .nameUz(dto.getNameUz()).nameRu(dto.getNameRu())
                .color(dto.getColor()).description(dto.getDescription()).build();
        return toDto(repository.save(entity));
    }

    @Transactional
    public StatusDto update(Long id, StatusDto dto) {
        Status entity = findOrThrow(id);
        entity.setNameUz(dto.getNameUz());
        entity.setNameRu(dto.getNameRu());
        entity.setColor(dto.getColor());
        entity.setDescription(dto.getDescription());
        return toDto(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        Status entity = findOrThrow(id);
        entity.setIsDeleted(true);
        entity.setDeletedAt(LocalDateTime.now());
        repository.save(entity);
    }

    private Status findOrThrow(Long id) {
        return repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Status topilmadi: " + id));
    }

    private StatusDto toDto(Status e) {
        StatusDto dto = new StatusDto();
        dto.setId(e.getId());
        dto.setNameUz(e.getNameUz());
        dto.setNameRu(e.getNameRu());
        dto.setColor(e.getColor());
        dto.setDescription(e.getDescription());
        return dto;
    }
}
