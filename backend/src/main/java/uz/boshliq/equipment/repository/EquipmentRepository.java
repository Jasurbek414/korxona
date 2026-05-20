package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import uz.boshliq.equipment.entity.Equipment;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long>, JpaSpecificationExecutor<Equipment> {

    Optional<Equipment> findByIdAndIsDeletedFalse(Long id);

    Optional<Equipment> findByInventoryNumberAndIsDeletedFalse(String inventoryNumber);

    boolean existsByInventoryNumberAndIsDeletedFalse(String inventoryNumber);

    long countByIsDeletedFalse();

    long countByStatusIdAndIsDeletedFalse(Long statusId);

    List<Equipment> findAllByCategoryIdAndIsDeletedFalse(Long categoryId);

    long countByCategoryIdAndIsDeletedFalse(Long categoryId);
}
