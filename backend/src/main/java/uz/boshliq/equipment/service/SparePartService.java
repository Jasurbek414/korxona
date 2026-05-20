package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
 * TZ 4.1: Ehtiyot qismlar katalogi CRUD.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SparePartService {

    private final SparePartRepository sparePartRepository;
    private final SparePartCategoryRepository categoryRepository;
    private final MeasurementUnitRepository unitRepository;
    private final WarehouseStockRepository stockRepository;

    @Transactional(readOnly = true)
    public List<SparePartDto> getAll() {
        return sparePartRepository.findAll().stream()
                .filter(sp -> !sp.getIsDeleted())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SparePartDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public SparePartDto getByCode(String code) {
        return toDto(sparePartRepository.findByCodeAndIsDeletedFalse(code)
                .orElseThrow(() -> new ResourceNotFoundException("Kod topilmadi: " + code)));
    }

    @Transactional
    public SparePartDto create(SparePartRequest req) {
        if (sparePartRepository.existsByCodeAndIsDeletedFalse(req.getCode())) {
            throw new BadRequestException("Bu kod mavjud: " + req.getCode());
        }

        SparePart sp = SparePart.builder()
                .name(req.getName())
                .code(req.getCode())
                .price(req.getPrice() != null ? req.getPrice() : BigDecimal.ZERO)
                .minStock(req.getMinStock() != null ? req.getMinStock() : 0)
                .reserveStock(req.getReserveStock() != null ? req.getReserveStock() : 0)
                .barcode(req.getBarcode())
                .description(req.getDescription())
                .build();

        if (req.getCategoryId() != null) {
            sp.setCategory(categoryRepository.findByIdAndIsDeletedFalse(req.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Toifa topilmadi")));
        }
        if (req.getUnitId() != null) {
            sp.setUnit(unitRepository.findByIdAndIsDeletedFalse(req.getUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Birlik topilmadi")));
        }

        return toDto(sparePartRepository.save(sp));
    }

    @Transactional
    public SparePartDto update(Long id, SparePartRequest req) {
        SparePart sp = findOrThrow(id);
        sp.setName(req.getName());
        sp.setCode(req.getCode());
        sp.setPrice(req.getPrice());
        sp.setMinStock(req.getMinStock());
        sp.setReserveStock(req.getReserveStock());
        sp.setBarcode(req.getBarcode());
        sp.setDescription(req.getDescription());

        if (req.getCategoryId() != null) {
            sp.setCategory(categoryRepository.findByIdAndIsDeletedFalse(req.getCategoryId()).orElse(null));
        }
        if (req.getUnitId() != null) {
            sp.setUnit(unitRepository.findByIdAndIsDeletedFalse(req.getUnitId()).orElse(null));
        }

        return toDto(sparePartRepository.save(sp));
    }

    @Transactional
    public void delete(Long id) {
        SparePart sp = findOrThrow(id);
        sp.setIsDeleted(true);
        sp.setDeletedAt(LocalDateTime.now());
        sparePartRepository.save(sp);
    }

    // Ma'lumotnomalar
    public List<SparePartCategory> getCategories() {
        return categoryRepository.findAllByIsDeletedFalse();
    }

    public List<MeasurementUnit> getUnits() {
        return unitRepository.findAllByIsDeletedFalse();
    }

    // YORDAMCHI
    private SparePart findOrThrow(Long id) {
        return sparePartRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ehtiyot qism topilmadi: " + id));
    }

    private SparePartDto toDto(SparePart sp) {
        SparePartDto d = new SparePartDto();
        d.setId(sp.getId());
        d.setName(sp.getName());
        d.setCode(sp.getCode());
        d.setPrice(sp.getPrice());
        d.setMinStock(sp.getMinStock());
        d.setReserveStock(sp.getReserveStock());
        d.setBarcode(sp.getBarcode());
        d.setDescription(sp.getDescription());
        if (sp.getCategory() != null) {
            d.setCategoryId(sp.getCategory().getId());
            d.setCategoryName(sp.getCategory().getNameUz());
        }
        if (sp.getUnit() != null) {
            d.setUnitId(sp.getUnit().getId());
            d.setUnitName(sp.getUnit().getShortName());
        }
        // Umumiy qoldiq
        d.setTotalStock(stockRepository.getTotalQuantity(sp.getId()));
        d.setLowStock(d.getTotalStock() <= sp.getMinStock());
        return d;
    }

    // DTO
    @lombok.Data
    public static class SparePartRequest {
        private String name;
        private String code;
        private Long categoryId;
        private Long unitId;
        private BigDecimal price;
        private Integer minStock;
        private Integer reserveStock;
        private String barcode;
        private String description;
    }

    @lombok.Data
    public static class SparePartDto {
        private Long id;
        private String name;
        private String code;
        private Long categoryId;
        private String categoryName;
        private Long unitId;
        private String unitName;
        private BigDecimal price;
        private Integer minStock;
        private Integer reserveStock;
        private String barcode;
        private String description;
        private int totalStock;
        private boolean lowStock;
    }
}
