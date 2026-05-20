package uz.boshliq.equipment.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import uz.boshliq.equipment.entity.StockOperation;
import java.time.LocalDateTime;
import java.util.List;

public interface StockOperationRepository extends JpaRepository<StockOperation, Long> {
    Page<StockOperation> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<StockOperation> findAllByWarehouseIdOrderByCreatedAtDesc(Long warehouseId, Pageable pageable);
    Page<StockOperation> findAllBySparePartIdOrderByCreatedAtDesc(Long sparePartId, Pageable pageable);
    List<StockOperation> findAllByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
    List<StockOperation> findAllByPprTaskId(Long pprTaskId);
}
