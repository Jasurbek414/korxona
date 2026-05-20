package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.boshliq.equipment.entity.Manufacturer;

import java.util.List;
import java.util.Optional;

@Repository
public interface ManufacturerRepository extends JpaRepository<Manufacturer, Long> {
    List<Manufacturer> findAllByIsDeletedFalseOrderByNameAsc();
    Optional<Manufacturer> findByIdAndIsDeletedFalse(Long id);
}
