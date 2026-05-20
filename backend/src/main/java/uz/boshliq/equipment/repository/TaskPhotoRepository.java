package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.boshliq.equipment.entity.TaskPhoto;
import java.util.List;

public interface TaskPhotoRepository extends JpaRepository<TaskPhoto, Long> {
    List<TaskPhoto> findAllByTaskIdOrderByCreatedAtDesc(Long taskId);
    List<TaskPhoto> findAllByTaskIdAndPhotoType(Long taskId, TaskPhoto.PhotoType photoType);
}
