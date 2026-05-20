package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.entity.*;
import uz.boshliq.equipment.exception.BadRequestException;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * TZ 4.3-4.5: Ombor operatsiyalari xizmati.
 * Kirim, chiqim, harakat (transfer), hisobdan chiqarish.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseStockRepository stockRepository;
    private final StockOperationRepository operationRepository;
    private final SparePartRepository sparePartRepository;
    private final PprTaskRepository pprTaskRepository;

    // ======================== KIRIM (TZ 4.3) ========================

    @Transactional
    public StockOperationDto incoming(Long warehouseId, Long sparePartId, int quantity,
                                      BigDecimal pricePerUnit, String supplier,
                                      String documentNumber, String notes, User performedBy) {
        Warehouse wh = findWarehouse(warehouseId);
        SparePart sp = findSparePart(sparePartId);

        if (quantity <= 0) throw new BadRequestException("Miqdor musbat bo'lishi kerak");

        // Qoldiqni yangilash
        WarehouseStock stock = getOrCreateStock(wh, sp);
        stock.setQuantity(stock.getQuantity() + quantity);
        stockRepository.save(stock);

        // Operatsiya yozish
        BigDecimal total = pricePerUnit != null ? pricePerUnit.multiply(BigDecimal.valueOf(quantity)) : null;
        StockOperation op = StockOperation.builder()
                .operationType(StockOperation.OperationType.INCOMING)
                .sparePart(sp).warehouse(wh).quantity(quantity)
                .pricePerUnit(pricePerUnit).totalPrice(total)
                .supplier(supplier).documentNumber(documentNumber)
                .notes(notes).performedBy(performedBy)
                .build();

        log.info("KIRIM: {} x{} -> {} ombor", sp.getCode(), quantity, wh.getName());
        return toDto(operationRepository.save(op));
    }

    // ======================== CHIQIM (TZ 4.3) ========================

    @Transactional
    public StockOperationDto outgoing(Long warehouseId, Long sparePartId, int quantity,
                                       String reason, String receiver, Long pprTaskId,
                                       String notes, User performedBy) {
        Warehouse wh = findWarehouse(warehouseId);
        SparePart sp = findSparePart(sparePartId);

        if (quantity <= 0) throw new BadRequestException("Miqdor musbat bo'lishi kerak");

        // Qoldiq tekshiruv
        WarehouseStock stock = stockRepository.findByWarehouseIdAndSparePartId(warehouseId, sparePartId)
                .orElseThrow(() -> new BadRequestException("Omborda bu ehtiyot qism yo'q"));
        if (stock.getQuantity() < quantity) {
            throw new BadRequestException(
                    String.format("Yetarli qoldiq yo'q: mavjud=%d, so'ralgan=%d", stock.getQuantity(), quantity));
        }

        stock.setQuantity(stock.getQuantity() - quantity);
        stockRepository.save(stock);

        StockOperation op = StockOperation.builder()
                .operationType(StockOperation.OperationType.OUTGOING)
                .sparePart(sp).warehouse(wh).quantity(quantity)
                .reason(reason).receiver(receiver)
                .notes(notes).performedBy(performedBy)
                .build();

        // PPR integratsiya (TZ 4.4)
        if (pprTaskId != null) {
            op.setPprTask(pprTaskRepository.findByIdAndIsDeletedFalse(pprTaskId).orElse(null));
        }

        log.info("CHIQIM: {} x{} <- {} ombor", sp.getCode(), quantity, wh.getName());
        return toDto(operationRepository.save(op));
    }

    // ======================== HARAKAT / TRANSFER (TZ 4.3) ========================

    @Transactional
    public StockOperationDto transfer(Long fromWarehouseId, Long toWarehouseId,
                                       Long sparePartId, int quantity,
                                       String notes, User performedBy) {
        if (fromWarehouseId.equals(toWarehouseId)) {
            throw new BadRequestException("Bir xil omborga ko'chirib bo'lmaydi");
        }

        Warehouse fromWh = findWarehouse(fromWarehouseId);
        Warehouse toWh = findWarehouse(toWarehouseId);
        SparePart sp = findSparePart(sparePartId);

        if (quantity <= 0) throw new BadRequestException("Miqdor musbat bo'lishi kerak");

        // Chiqarish
        WarehouseStock fromStock = stockRepository.findByWarehouseIdAndSparePartId(fromWarehouseId, sparePartId)
                .orElseThrow(() -> new BadRequestException("Manba omborda bu ehtiyot qism yo'q"));
        if (fromStock.getQuantity() < quantity) {
            throw new BadRequestException("Yetarli qoldiq yo'q");
        }
        fromStock.setQuantity(fromStock.getQuantity() - quantity);
        stockRepository.save(fromStock);

        // Kiritish
        WarehouseStock toStock = getOrCreateStock(toWh, sp);
        toStock.setQuantity(toStock.getQuantity() + quantity);
        stockRepository.save(toStock);

        StockOperation op = StockOperation.builder()
                .operationType(StockOperation.OperationType.TRANSFER)
                .sparePart(sp).warehouse(fromWh).targetWarehouse(toWh)
                .quantity(quantity).notes(notes).performedBy(performedBy)
                .build();

        log.info("TRANSFER: {} x{} ({} -> {})", sp.getCode(), quantity, fromWh.getName(), toWh.getName());
        return toDto(operationRepository.save(op));
    }

    // ======================== HISOBDAN CHIQARISH (TZ 4.3) ========================

    @Transactional
    public StockOperationDto writeOff(Long warehouseId, Long sparePartId, int quantity,
                                       String reason, String actNumber, String notes, User performedBy) {
        Warehouse wh = findWarehouse(warehouseId);
        SparePart sp = findSparePart(sparePartId);

        WarehouseStock stock = stockRepository.findByWarehouseIdAndSparePartId(warehouseId, sparePartId)
                .orElseThrow(() -> new BadRequestException("Omborda bu ehtiyot qism yo'q"));
        if (stock.getQuantity() < quantity) {
            throw new BadRequestException("Yetarli qoldiq yo'q");
        }

        stock.setQuantity(stock.getQuantity() - quantity);
        stockRepository.save(stock);

        StockOperation op = StockOperation.builder()
                .operationType(StockOperation.OperationType.WRITE_OFF)
                .sparePart(sp).warehouse(wh).quantity(quantity)
                .reason(reason).actNumber(actNumber)
                .notes(notes).performedBy(performedBy)
                .build();

        log.info("HISOBDAN CHIQARISH: {} x{} <- {} ombor", sp.getCode(), quantity, wh.getName());
        return toDto(operationRepository.save(op));
    }

    // ======================== QOLDIQLAR (TZ 4.2, 4.5) ========================

    /** Ombordagi barcha qoldiqlar */
    @Transactional(readOnly = true)
    public List<StockDto> getStockByWarehouse(Long warehouseId) {
        return stockRepository.findAllByWarehouseId(warehouseId)
                .stream().map(this::toStockDto).collect(Collectors.toList());
    }

    /** Ehtiyot qismning barcha omborlardagi qoldig'i */
    @Transactional(readOnly = true)
    public List<StockDto> getStockBySparePart(Long sparePartId) {
        return stockRepository.findAllBySparePartId(sparePartId)
                .stream().map(this::toStockDto).collect(Collectors.toList());
    }

    /** Minimal qoldiqdan past bo'lganlar (TZ 4.5) */
    @Transactional(readOnly = true)
    public List<StockDto> getLowStockAlerts() {
        return stockRepository.findLowStockItems()
                .stream().map(this::toStockDto).collect(Collectors.toList());
    }

    /** Operatsiyalar tarixi */
    @Transactional(readOnly = true)
    public Page<StockOperationDto> getOperations(Long warehouseId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<StockOperation> result;
        if (warehouseId != null) {
            result = operationRepository.findAllByWarehouseIdOrderByCreatedAtDesc(warehouseId, pageable);
        } else {
            result = operationRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return result.map(this::toDto);
    }

    // ======================== YORDAMCHI ========================

    private WarehouseStock getOrCreateStock(Warehouse wh, SparePart sp) {
        return stockRepository.findByWarehouseIdAndSparePartId(wh.getId(), sp.getId())
                .orElseGet(() -> {
                    WarehouseStock s = new WarehouseStock();
                    s.setWarehouse(wh);
                    s.setSparePart(sp);
                    s.setQuantity(0);
                    return s;
                });
    }

    private Warehouse findWarehouse(Long id) {
        return warehouseRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ombor topilmadi: " + id));
    }

    private SparePart findSparePart(Long id) {
        return sparePartRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ehtiyot qism topilmadi: " + id));
    }

    // DTO Mapping
    private StockOperationDto toDto(StockOperation op) {
        StockOperationDto d = new StockOperationDto();
        d.setId(op.getId());
        d.setOperationType(op.getOperationType().name());
        d.setQuantity(op.getQuantity());
        d.setPricePerUnit(op.getPricePerUnit());
        d.setTotalPrice(op.getTotalPrice());
        d.setSupplier(op.getSupplier());
        d.setDocumentNumber(op.getDocumentNumber());
        d.setReason(op.getReason());
        d.setReceiver(op.getReceiver());
        d.setActNumber(op.getActNumber());
        d.setNotes(op.getNotes());
        d.setCreatedAt(op.getCreatedAt());
        if (op.getSparePart() != null) {
            d.setSparePartId(op.getSparePart().getId());
            d.setSparePartName(op.getSparePart().getName());
            d.setSparePartCode(op.getSparePart().getCode());
        }
        if (op.getWarehouse() != null) {
            d.setWarehouseId(op.getWarehouse().getId());
            d.setWarehouseName(op.getWarehouse().getName());
        }
        if (op.getTargetWarehouse() != null) {
            d.setTargetWarehouseId(op.getTargetWarehouse().getId());
            d.setTargetWarehouseName(op.getTargetWarehouse().getName());
        }
        if (op.getPerformedBy() != null) {
            d.setPerformedByName(op.getPerformedBy().getFullName());
        }
        return d;
    }

    private StockDto toStockDto(WarehouseStock s) {
        StockDto d = new StockDto();
        d.setId(s.getId());
        d.setQuantity(s.getQuantity());
        if (s.getWarehouse() != null) {
            d.setWarehouseId(s.getWarehouse().getId());
            d.setWarehouseName(s.getWarehouse().getName());
        }
        if (s.getSparePart() != null) {
            d.setSparePartId(s.getSparePart().getId());
            d.setSparePartName(s.getSparePart().getName());
            d.setSparePartCode(s.getSparePart().getCode());
            d.setMinStock(s.getSparePart().getMinStock());
            d.setIsLowStock(s.getQuantity() <= s.getSparePart().getMinStock());
            if (s.getSparePart().getUnit() != null) {
                d.setUnitName(s.getSparePart().getUnit().getShortName());
            }
        }
        return d;
    }

    // Inner DTOs
    @lombok.Data
    public static class StockOperationDto {
        private Long id;
        private String operationType;
        private Long sparePartId;
        private String sparePartName;
        private String sparePartCode;
        private Long warehouseId;
        private String warehouseName;
        private Long targetWarehouseId;
        private String targetWarehouseName;
        private Integer quantity;
        private BigDecimal pricePerUnit;
        private BigDecimal totalPrice;
        private String supplier;
        private String documentNumber;
        private String reason;
        private String receiver;
        private String actNumber;
        private String notes;
        private String performedByName;
        private LocalDateTime createdAt;
    }

    @lombok.Data
    public static class StockDto {
        private Long id;
        private Long warehouseId;
        private String warehouseName;
        private Long sparePartId;
        private String sparePartName;
        private String sparePartCode;
        private String unitName;
        private Integer quantity;
        private Integer minStock;
        private Boolean isLowStock;
    }
}
