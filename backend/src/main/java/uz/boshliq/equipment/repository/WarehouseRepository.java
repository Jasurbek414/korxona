package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.boshliq.equipment.entity.Warehouse;
import java.util.List;
import java.util.Optional;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    List<Warehouse> findAllByIsDeletedFalseAndIsActiveTrue();
    Optional<Warehouse> findByIdAndIsDeletedFalse(Long id);
}
