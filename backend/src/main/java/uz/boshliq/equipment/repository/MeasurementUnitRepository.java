package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.boshliq.equipment.entity.MeasurementUnit;
import java.util.List;
import java.util.Optional;

public interface MeasurementUnitRepository extends JpaRepository<MeasurementUnit, Long> {
    List<MeasurementUnit> findAllByIsDeletedFalse();
    Optional<MeasurementUnit> findByIdAndIsDeletedFalse(Long id);
}
