package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import uz.boshliq.equipment.entity.WarehouseStock;
import java.util.List;
import java.util.Optional;

public interface WarehouseStockRepository extends JpaRepository<WarehouseStock, Long> {
    Optional<WarehouseStock> findByWarehouseIdAndSparePartId(Long warehouseId, Long sparePartId);
    List<WarehouseStock> findAllByWarehouseId(Long warehouseId);
    List<WarehouseStock> findAllBySparePartId(Long sparePartId);

    /** Minimal qoldiqdan past bo'lganlar (TZ 4.5) */
    @Query("SELECT ws FROM WarehouseStock ws JOIN ws.sparePart sp " +
           "WHERE ws.quantity <= sp.minStock AND sp.isDeleted = false")
    List<WarehouseStock> findLowStockItems();

    /** Umumiy qoldiq (barcha omborlar) */
    @Query("SELECT COALESCE(SUM(ws.quantity), 0) FROM WarehouseStock ws WHERE ws.sparePart.id = :sparePartId")
    int getTotalQuantity(Long sparePartId);
}
