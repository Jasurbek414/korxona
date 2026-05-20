package uz.boshliq.equipment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import uz.boshliq.equipment.entity.User;
import uz.boshliq.equipment.service.WarehouseService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * TZ 4.2-4.5: Ombor operatsiyalari API.
 */
@RestController
@RequestMapping("/api/v1/warehouse")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService service;

    // ====== Qoldiqlar ======

    @GetMapping("/stocks/{warehouseId}")
    public ResponseEntity<List<WarehouseService.StockDto>> getStockByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(service.getStockByWarehouse(warehouseId));
    }

    @GetMapping("/stocks/spare-part/{sparePartId}")
    public ResponseEntity<List<WarehouseService.StockDto>> getStockBySparePart(@PathVariable Long sparePartId) {
        return ResponseEntity.ok(service.getStockBySparePart(sparePartId));
    }

    /** TZ 4.5: Minimal qoldiqdan past — ogohlantirish */
    @GetMapping("/alerts/low-stock")
    public ResponseEntity<List<WarehouseService.StockDto>> getLowStockAlerts() {
        return ResponseEntity.ok(service.getLowStockAlerts());
    }

    // ====== Operatsiyalar tarixi ======

    @GetMapping("/operations")
    public ResponseEntity<Page<WarehouseService.StockOperationDto>> getOperations(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(service.getOperations(warehouseId, page, size));
    }

    // ====== Kirim (TZ 4.3) ======

    @PostMapping("/incoming")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<WarehouseService.StockOperationDto> incoming(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.incoming(
                ((Number) body.get("warehouseId")).longValue(),
                ((Number) body.get("sparePartId")).longValue(),
                ((Number) body.get("quantity")).intValue(),
                body.get("pricePerUnit") != null ? new BigDecimal(body.get("pricePerUnit").toString()) : null,
                (String) body.get("supplier"),
                (String) body.get("documentNumber"),
                (String) body.get("notes"),
                user
        ));
    }

    // ====== Chiqim (TZ 4.3) ======

    @PostMapping("/outgoing")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<WarehouseService.StockOperationDto> outgoing(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.outgoing(
                ((Number) body.get("warehouseId")).longValue(),
                ((Number) body.get("sparePartId")).longValue(),
                ((Number) body.get("quantity")).intValue(),
                (String) body.get("reason"),
                (String) body.get("receiver"),
                body.get("pprTaskId") != null ? ((Number) body.get("pprTaskId")).longValue() : null,
                (String) body.get("notes"),
                user
        ));
    }

    // ====== Harakat / Transfer (TZ 4.3) ======

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<WarehouseService.StockOperationDto> transfer(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.transfer(
                ((Number) body.get("fromWarehouseId")).longValue(),
                ((Number) body.get("toWarehouseId")).longValue(),
                ((Number) body.get("sparePartId")).longValue(),
                ((Number) body.get("quantity")).intValue(),
                (String) body.get("notes"),
                user
        ));
    }

    // ====== Hisobdan chiqarish (TZ 4.3) ======

    @PostMapping("/write-off")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<WarehouseService.StockOperationDto> writeOff(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.writeOff(
                ((Number) body.get("warehouseId")).longValue(),
                ((Number) body.get("sparePartId")).longValue(),
                ((Number) body.get("quantity")).intValue(),
                (String) body.get("reason"),
                (String) body.get("actNumber"),
                (String) body.get("notes"),
                user
        ));
    }
}
