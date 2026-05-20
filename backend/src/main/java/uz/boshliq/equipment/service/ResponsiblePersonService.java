package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.dto.ResponsiblePersonDto;
import uz.boshliq.equipment.entity.ResponsiblePerson;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.ResponsiblePersonRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResponsiblePersonService {

    private final ResponsiblePersonRepository repository;

    public List<ResponsiblePersonDto> getAll() {
        return repository.findAllByIsDeletedFalseOrderByFullNameAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public ResponsiblePersonDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public ResponsiblePersonDto create(ResponsiblePersonDto dto) {
        ResponsiblePerson entity = ResponsiblePerson.builder()
                .fullName(dto.getFullName()).position(dto.getPosition())
                .phone(dto.getPhone()).email(dto.getEmail()).build();
        return toDto(repository.save(entity));
    }

    @Transactional
    public ResponsiblePersonDto update(Long id, ResponsiblePersonDto dto) {
        ResponsiblePerson entity = findOrThrow(id);
        entity.setFullName(dto.getFullName());
        entity.setPosition(dto.getPosition());
        entity.setPhone(dto.getPhone());
        entity.setEmail(dto.getEmail());
        return toDto(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        ResponsiblePerson entity = findOrThrow(id);
        entity.setIsDeleted(true);
        entity.setDeletedAt(LocalDateTime.now());
        repository.save(entity);
    }

    private ResponsiblePerson findOrThrow(Long id) {
        return repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mas'ul shaxs topilmadi: " + id));
    }

    private ResponsiblePersonDto toDto(ResponsiblePerson e) {
        ResponsiblePersonDto dto = new ResponsiblePersonDto();
        dto.setId(e.getId());
        dto.setFullName(e.getFullName());
        dto.setPosition(e.getPosition());
        dto.setPhone(e.getPhone());
        dto.setEmail(e.getEmail());
        return dto;
    }
}
