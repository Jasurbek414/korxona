package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.boshliq.equipment.entity.PprType;
import java.util.List;
import java.util.Optional;

public interface PprTypeRepository extends JpaRepository<PprType, Long> {
    List<PprType> findAllByIsDeletedFalse();
    Optional<PprType> findByIdAndIsDeletedFalse(Long id);
}
