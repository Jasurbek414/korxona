package uz.boshliq.equipment.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.boshliq.equipment.entity.AuditLog;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<AuditLog> findAllByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<AuditLog> findAllByActionOrderByCreatedAtDesc(String action, Pageable pageable);
}
