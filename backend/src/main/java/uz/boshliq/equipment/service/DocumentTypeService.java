package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.dto.DocumentTypeDto;
import uz.boshliq.equipment.entity.DocumentType;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.DocumentTypeRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentTypeService {

    private final DocumentTypeRepository repository;

    public List<DocumentTypeDto> getAll() {
        return repository.findAllByIsDeletedFalseOrderByNameUzAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public DocumentTypeDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public DocumentTypeDto create(DocumentTypeDto dto) {
        DocumentType entity = DocumentType.builder()
                .nameUz(dto.getNameUz()).nameRu(dto.getNameRu()).build();
        return toDto(repository.save(entity));
    }

    @Transactional
    public DocumentTypeDto update(Long id, DocumentTypeDto dto) {
        DocumentType entity = findOrThrow(id);
        entity.setNameUz(dto.getNameUz());
        entity.setNameRu(dto.getNameRu());
        return toDto(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        DocumentType entity = findOrThrow(id);
        entity.setIsDeleted(true);
        entity.setDeletedAt(LocalDateTime.now());
        repository.save(entity);
    }

    private DocumentType findOrThrow(Long id) {
        return repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hujjat turi topilmadi: " + id));
    }

    private DocumentTypeDto toDto(DocumentType e) {
        DocumentTypeDto dto = new DocumentTypeDto();
        dto.setId(e.getId());
        dto.setNameUz(e.getNameUz());
        dto.setNameRu(e.getNameRu());
        return dto;
    }
}
