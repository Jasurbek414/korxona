package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.boshliq.equipment.entity.ServiceInterval;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ServiceIntervalRepository extends JpaRepository<ServiceInterval, Long> {
    List<ServiceInterval> findAllByIsDeletedFalseAndIsActiveTrue();
    List<ServiceInterval> findAllByEquipmentIdAndIsDeletedFalse(Long equipmentId);
    List<ServiceInterval> findAllByNextDueDateLessThanEqualAndIsActiveTrueAndIsDeletedFalse(LocalDate date);
    Optional<ServiceInterval> findByIdAndIsDeletedFalse(Long id);
}
