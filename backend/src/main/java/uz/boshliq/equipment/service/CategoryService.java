package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.dto.CategoryDto;
import uz.boshliq.equipment.entity.Category;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.CategoryRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDto> getAll() {
        return categoryRepository.findAllByIsDeletedFalseOrderByNameUzAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public CategoryDto getById(Long id) {
        Category entity = findOrThrow(id);
        return toDto(entity);
    }

    @Transactional
    public CategoryDto create(CategoryDto dto) {
        Category entity = Category.builder()
                .nameUz(dto.getNameUz())
                .nameRu(dto.getNameRu())
                .description(dto.getDescription())
                .build();
        return toDto(categoryRepository.save(entity));
    }

    @Transactional
    public CategoryDto update(Long id, CategoryDto dto) {
        Category entity = findOrThrow(id);
        entity.setNameUz(dto.getNameUz());
        entity.setNameRu(dto.getNameRu());
        entity.setDescription(dto.getDescription());
        return toDto(categoryRepository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        Category entity = findOrThrow(id);
        entity.setIsDeleted(true);
        entity.setDeletedAt(LocalDateTime.now());
        categoryRepository.save(entity);
    }

    private Category findOrThrow(Long id) {
        return categoryRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Toifa topilmadi: " + id));
    }

    private CategoryDto toDto(Category entity) {
        CategoryDto dto = new CategoryDto();
        dto.setId(entity.getId());
        dto.setNameUz(entity.getNameUz());
        dto.setNameRu(entity.getNameRu());
        dto.setDescription(entity.getDescription());
        return dto;
    }
}
