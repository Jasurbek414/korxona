package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.entity.PprType;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.PprTypeRepository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * PPR turi ma'lumotnomasi xizmati.
 */
@Service
@RequiredArgsConstructor
public class PprTypeService {
    private final PprTypeRepository repository;

    public List<PprType> getAll() {
        return repository.findAllByIsDeletedFalse();
    }

    public PprType getById(Long id) {
        return repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("PPR turi topilmadi: " + id));
    }

    @Transactional
    public PprType create(PprType pprType) {
        return repository.save(pprType);
    }

    @Transactional
    public PprType update(Long id, PprType updated) {
        PprType existing = getById(id);
        existing.setNameUz(updated.getNameUz());
        existing.setNameRu(updated.getNameRu());
        existing.setDescription(updated.getDescription());
        return repository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        PprType pprType = getById(id);
        pprType.setIsDeleted(true);
        pprType.setDeletedAt(LocalDateTime.now());
        repository.save(pprType);
    }
}
