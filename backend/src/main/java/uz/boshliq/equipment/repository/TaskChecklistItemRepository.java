package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.boshliq.equipment.entity.TaskChecklistItem;
import java.util.List;

public interface TaskChecklistItemRepository extends JpaRepository<TaskChecklistItem, Long> {
    List<TaskChecklistItem> findAllByTaskIdOrderBySortOrder(Long taskId);
}
