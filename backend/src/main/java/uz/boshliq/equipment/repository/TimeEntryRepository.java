package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import uz.boshliq.equipment.entity.TimeEntry;
import java.util.List;

public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {
    List<TimeEntry> findAllByTaskIdOrderByStartTimeDesc(Long taskId);

    @Query("SELECT COALESCE(SUM(t.durationMinutes), 0) FROM TimeEntry t WHERE t.task.id = :taskId")
    int sumDurationByTaskId(Long taskId);
}
