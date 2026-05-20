package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.boshliq.equipment.entity.TaskRescheduleHistory;
import java.util.List;

public interface TaskRescheduleHistoryRepository extends JpaRepository<TaskRescheduleHistory, Long> {
    List<TaskRescheduleHistory> findAllByTaskIdOrderByCreatedAtDesc(Long taskId);
}
