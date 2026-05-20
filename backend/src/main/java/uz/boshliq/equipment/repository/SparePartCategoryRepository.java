package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.boshliq.equipment.entity.SparePartCategory;
import java.util.List;
import java.util.Optional;

public interface SparePartCategoryRepository extends JpaRepository<SparePartCategory, Long> {
    List<SparePartCategory> findAllByIsDeletedFalse();
    Optional<SparePartCategory> findByIdAndIsDeletedFalse(Long id);
}
