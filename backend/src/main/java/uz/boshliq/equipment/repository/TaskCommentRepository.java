package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.boshliq.equipment.entity.TaskComment;
import java.util.List;

public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {
    List<TaskComment> findAllByTaskIdOrderByCreatedAtDesc(Long taskId);
}
