package uz.boshliq.equipment.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import uz.boshliq.equipment.entity.PprTask;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PprTaskRepository extends JpaRepository<PprTask, Long>, JpaSpecificationExecutor<PprTask> {
    Optional<PprTask> findByIdAndIsDeletedFalse(Long id);

    /** Muddati o'tgan vazifalar (TZ 3.7) */
    List<PprTask> findAllByScheduledDateBeforeAndStatusAndIsDeletedFalse(
            LocalDate date, PprTask.TaskStatus status);

    /** Uskuna bo'yicha vazifalar */
    Page<PprTask> findAllByEquipmentIdAndIsDeletedFalse(Long equipmentId, Pageable pageable);

    /** Kunlik/haftalik/oylik kalendar uchun */
    List<PprTask> findAllByScheduledDateBetweenAndIsDeletedFalse(LocalDate from, LocalDate to);

    /** Keyingi vazifa raqami uchun */
    @Query("SELECT COUNT(t) FROM PprTask t")
    long countAll();

    boolean existsByTaskNumberAndIsDeletedFalse(String taskNumber);
}
