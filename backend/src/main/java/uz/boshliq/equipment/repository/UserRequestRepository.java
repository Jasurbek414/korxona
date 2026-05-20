package uz.boshliq.equipment.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import uz.boshliq.equipment.entity.UserRequest;
import java.util.Optional;

public interface UserRequestRepository extends JpaRepository<UserRequest, Long> {
    Optional<UserRequest> findByIdAndIsDeletedFalse(Long id);
    Page<UserRequest> findAllByIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);
    Page<UserRequest> findAllByRequestedByIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
