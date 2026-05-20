package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import uz.boshliq.equipment.entity.Status;

import java.util.List;
import java.util.Optional;

@Repository
public interface StatusRepository extends JpaRepository<Status, Long> {
    List<Status> findAllByIsDeletedFalseOrderByNameUzAsc();
    Optional<Status> findByIdAndIsDeletedFalse(Long id);

    /** Uskunalar statuslar bo'yicha guruhlangan hisobot */
    @Query("SELECT s.nameUz AS statusName, COUNT(e) AS count " +
           "FROM Equipment e JOIN e.status s WHERE e.isDeleted = false GROUP BY s.nameUz")
    List<StatusCount> findStatusCounts();

    interface StatusCount {
        String getStatusName();
        Long getCount();
    }
}

