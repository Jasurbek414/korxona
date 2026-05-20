package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.dto.PageResponse;
import uz.boshliq.equipment.dto.equipment.EquipmentRequest;
import uz.boshliq.equipment.dto.equipment.EquipmentResponse;
import uz.boshliq.equipment.dto.equipment.StatusHistoryResponse;
import uz.boshliq.equipment.entity.*;
import uz.boshliq.equipment.exception.BadRequestException;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final CategoryRepository categoryRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final ModelRepository modelRepository;
    private final StatusRepository statusRepository;
    private final LocationRepository locationRepository;
    private final ResponsiblePersonRepository responsiblePersonRepository;
    private final EquipmentStatusHistoryRepository statusHistoryRepository;

    /**
     * TZ 2.8: Uskunalar ro'yxati — qidiruv, filtrlash, saralash, paginatsiya
     */
    public PageResponse<EquipmentResponse> getAll(
            String search,
            Long categoryId,
            Long statusId,
            Long locationId,
            Long responsiblePersonId,
            Long manufacturerId,
            String sortBy,
            String sortDir,
            int page,
            int size
    ) {
        Sort sort = Sort.by(
                "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy != null ? sortBy : "id"
        );
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Equipment> spec = notDeleted();

        if (search != null && !search.isBlank()) {
            spec = spec.and(searchByKeyword(search.trim()));
        }
        if (categoryId != null) spec = spec.and(byCategoryId(categoryId));
        if (statusId != null) spec = spec.and(byStatusId(statusId));
        if (locationId != null) spec = spec.and(byLocationId(locationId));
        if (responsiblePersonId != null) spec = spec.and(byResponsiblePersonId(responsiblePersonId));
        if (manufacturerId != null) spec = spec.and(byManufacturerId(manufacturerId));

        Page<Equipment> result = equipmentRepository.findAll(spec, pageable);

        return PageResponse.<EquipmentResponse>builder()
                .content(result.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    /**
     * TZ 2.9: Uskuna kartochkasi — batafsil ko'rish
     */
    public EquipmentResponse getById(Long id) {
        Equipment equipment = findOrThrow(id);
        return toResponse(equipment);
    }

    /**
     * Uskuna yaratish
     */
    @Transactional
    public EquipmentResponse create(EquipmentRequest request, User currentUser) {
        // Inventar raqami unikal tekshiruv
        if (equipmentRepository.existsByInventoryNumberAndIsDeletedFalse(request.getInventoryNumber())) {
            throw new BadRequestException("Bu inventar raqami allaqachon mavjud: " + request.getInventoryNumber());
        }

        Equipment equipment = new Equipment();
        mapRequestToEntity(request, equipment);
        equipment.setCreatedBy(currentUser);

        Equipment saved = equipmentRepository.save(equipment);

        // Birinchi status tarixi
        saveStatusHistory(saved, null, saved.getStatus(), currentUser, "Uskuna yaratildi");

        log.info("Uskuna yaratildi: {} ({})", saved.getName(), saved.getInventoryNumber());
        return toResponse(saved);
    }

    /**
     * Uskuna tahrirlash
     */
    @Transactional
    public EquipmentResponse update(Long id, EquipmentRequest request, User currentUser) {
        Equipment equipment = findOrThrow(id);

        // Inventar raqami o'zgargan bo'lsa unikal tekshiruv
        if (!equipment.getInventoryNumber().equals(request.getInventoryNumber())
                && equipmentRepository.existsByInventoryNumberAndIsDeletedFalse(request.getInventoryNumber())) {
            throw new BadRequestException("Bu inventar raqami allaqachon mavjud: " + request.getInventoryNumber());
        }

        // TZ 2.10: Status o'zgarishini qayd etish
        Status oldStatus = equipment.getStatus();
        mapRequestToEntity(request, equipment);

        if (!oldStatus.getId().equals(request.getStatusId())) {
            saveStatusHistory(equipment, oldStatus, equipment.getStatus(), currentUser, "Status o'zgartirildi");
        }

        Equipment saved = equipmentRepository.save(equipment);
        log.info("Uskuna tahrirlandi: {}", saved.getInventoryNumber());
        return toResponse(saved);
    }

    /**
     * TZ: Soft delete
     */
    @Transactional
    public void delete(Long id) {
        Equipment equipment = findOrThrow(id);
        equipment.setIsDeleted(true);
        equipment.setDeletedAt(LocalDateTime.now());
        equipmentRepository.save(equipment);
        log.info("Uskuna o'chirildi (soft): {}", equipment.getInventoryNumber());
    }

    /**
     * TZ 2.10: Status tarixi
     */
    public List<StatusHistoryResponse> getStatusHistory(Long equipmentId) {
        findOrThrow(equipmentId); // mavjudligini tekshirish
        return statusHistoryRepository.findAllByEquipmentIdOrderByCreatedAtDesc(equipmentId)
                .stream().map(this::toStatusHistoryResponse).collect(Collectors.toList());
    }

    // ======================== YORDAMCHI METODLAR ========================

    private void mapRequestToEntity(EquipmentRequest request, Equipment equipment) {
        equipment.setInventoryNumber(request.getInventoryNumber());
        equipment.setName(request.getName());
        equipment.setSerialNumber(request.getSerialNumber());
        equipment.setCommissionedDate(request.getCommissionedDate());
        equipment.setWarrantyDate(request.getWarrantyDate());
        equipment.setPurchasePrice(request.getPurchasePrice());
        equipment.setNotes(request.getNotes());

        equipment.setCategory(categoryRepository.findByIdAndIsDeletedFalse(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Toifa topilmadi: " + request.getCategoryId())));
        equipment.setStatus(statusRepository.findByIdAndIsDeletedFalse(request.getStatusId())
                .orElseThrow(() -> new ResourceNotFoundException("Status topilmadi: " + request.getStatusId())));
        equipment.setLocation(locationRepository.findByIdAndIsDeletedFalse(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Joylashuv topilmadi: " + request.getLocationId())));
        equipment.setResponsiblePerson(responsiblePersonRepository.findByIdAndIsDeletedFalse(request.getResponsiblePersonId())
                .orElseThrow(() -> new ResourceNotFoundException("Mas'ul shaxs topilmadi: " + request.getResponsiblePersonId())));

        if (request.getManufacturerId() != null) {
            equipment.setManufacturer(manufacturerRepository.findByIdAndIsDeletedFalse(request.getManufacturerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ishlab chiqaruvchi topilmadi")));
        }
        if (request.getModelId() != null) {
            equipment.setModel(modelRepository.findByIdAndIsDeletedFalse(request.getModelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Model topilmadi")));
        }
    }

    private void saveStatusHistory(Equipment eq, Status oldStatus, Status newStatus, User user, String reason) {
        EquipmentStatusHistory history = EquipmentStatusHistory.builder()
                .equipment(eq)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(user)
                .reason(reason)
                .build();
        statusHistoryRepository.save(history);
    }

    private Equipment findOrThrow(Long id) {
        return equipmentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Uskuna topilmadi: " + id));
    }

    // ======================== DTO MAPPING ========================

    private EquipmentResponse toResponse(Equipment e) {
        EquipmentResponse r = new EquipmentResponse();
        r.setId(e.getId());
        r.setInventoryNumber(e.getInventoryNumber());
        r.setName(e.getName());
        r.setSerialNumber(e.getSerialNumber());
        r.setCommissionedDate(e.getCommissionedDate());
        r.setWarrantyDate(e.getWarrantyDate());
        r.setPurchasePrice(e.getPurchasePrice());
        r.setNotes(e.getNotes());
        r.setQrCodePath(e.getQrCodePath());
        r.setCreatedAt(e.getCreatedAt());
        r.setUpdatedAt(e.getUpdatedAt());

        if (e.getCategory() != null) {
            r.setCategoryId(e.getCategory().getId());
            r.setCategoryName(e.getCategory().getNameUz());
        }
        if (e.getManufacturer() != null) {
            r.setManufacturerId(e.getManufacturer().getId());
            r.setManufacturerName(e.getManufacturer().getName());
        }
        if (e.getModel() != null) {
            r.setModelId(e.getModel().getId());
            r.setModelName(e.getModel().getName());
        }
        if (e.getStatus() != null) {
            r.setStatusId(e.getStatus().getId());
            r.setStatusName(e.getStatus().getNameUz());
            r.setStatusColor(e.getStatus().getColor());
        }
        if (e.getLocation() != null) {
            r.setLocationId(e.getLocation().getId());
            r.setLocationName(e.getLocation().getName());
        }
        if (e.getResponsiblePerson() != null) {
            r.setResponsiblePersonId(e.getResponsiblePerson().getId());
            r.setResponsiblePersonName(e.getResponsiblePerson().getFullName());
        }
        if (e.getCreatedBy() != null) {
            r.setCreatedByName(e.getCreatedBy().getFullName());
        }
        return r;
    }

    private StatusHistoryResponse toStatusHistoryResponse(EquipmentStatusHistory h) {
        StatusHistoryResponse r = new StatusHistoryResponse();
        r.setId(h.getId());
        r.setReason(h.getReason());
        r.setCreatedAt(h.getCreatedAt());
        if (h.getOldStatus() != null) {
            r.setOldStatusName(h.getOldStatus().getNameUz());
            r.setOldStatusColor(h.getOldStatus().getColor());
        }
        if (h.getNewStatus() != null) {
            r.setNewStatusName(h.getNewStatus().getNameUz());
            r.setNewStatusColor(h.getNewStatus().getColor());
        }
        if (h.getChangedBy() != null) {
            r.setChangedByName(h.getChangedBy().getFullName());
        }
        return r;
    }

    // ======================== JPA SPECIFICATION (FILTRLAR) ========================

    private Specification<Equipment> notDeleted() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    private Specification<Equipment> searchByKeyword(String keyword) {
        return (root, query, cb) -> {
            String pattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("inventoryNumber")), pattern),
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("serialNumber")), pattern)
            );
        };
    }

    private Specification<Equipment> byCategoryId(Long id) {
        return (root, query, cb) -> cb.equal(root.get("category").get("id"), id);
    }

    private Specification<Equipment> byStatusId(Long id) {
        return (root, query, cb) -> cb.equal(root.get("status").get("id"), id);
    }

    private Specification<Equipment> byLocationId(Long id) {
        return (root, query, cb) -> cb.equal(root.get("location").get("id"), id);
    }

    private Specification<Equipment> byResponsiblePersonId(Long id) {
        return (root, query, cb) -> cb.equal(root.get("responsiblePerson").get("id"), id);
    }

    private Specification<Equipment> byManufacturerId(Long id) {
        return (root, query, cb) -> cb.equal(root.get("manufacturer").get("id"), id);
    }
}
