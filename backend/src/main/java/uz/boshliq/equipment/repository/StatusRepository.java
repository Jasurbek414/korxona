package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.boshliq.equipment.entity.Status;

import java.util.List;
import java.util.Optional;

@Repository
public interface StatusRepository extends JpaRepository<Status, Long> {
    List<Status> findAllByIsDeletedFalseOrderByNameUzAsc();
    Optional<Status> findByIdAndIsDeletedFalse(Long id);
}
