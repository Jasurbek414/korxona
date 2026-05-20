package uz.boshliq.equipment.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import uz.boshliq.equipment.entity.SparePart;
import java.util.Optional;

public interface SparePartRepository extends JpaRepository<SparePart, Long>, JpaSpecificationExecutor<SparePart> {
    Optional<SparePart> findByIdAndIsDeletedFalse(Long id);
    Optional<SparePart> findByCodeAndIsDeletedFalse(String code);
    boolean existsByCodeAndIsDeletedFalse(String code);
}
