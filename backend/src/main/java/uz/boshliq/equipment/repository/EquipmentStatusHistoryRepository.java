package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.boshliq.equipment.entity.EquipmentStatusHistory;

import java.util.List;

@Repository
public interface EquipmentStatusHistoryRepository extends JpaRepository<EquipmentStatusHistory, Long> {
    List<EquipmentStatusHistory> findAllByEquipmentIdOrderByCreatedAtDesc(Long equipmentId);
}
