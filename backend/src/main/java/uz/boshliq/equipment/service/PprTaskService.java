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
import uz.boshliq.equipment.dto.ppr.*;
import uz.boshliq.equipment.entity.*;
import uz.boshliq.equipment.exception.BadRequestException;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * TZ 3.1-3.7: PPR vazifalar xizmati.
 * - CRUD, filtrlash, paginatsiya
 * - Status boshqaruvi: SCHEDULED → IN_PROGRESS → COMPLETED → APPROVED
 * - Ko'chirish tarixi (TZ 3.5)
 * - Muddati o'tgan ishlar (TZ 3.7)
 * - Avtomatik raqam generatsiya
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PprTaskService {

    private final PprTaskRepository taskRepository;
    private final EquipmentRepository equipmentRepository;
    private final PprTypeRepository pprTypeRepository;
    private final ServiceIntervalRepository serviceIntervalRepository;
    private final ResponsiblePersonRepository responsiblePersonRepository;
    private final TaskRescheduleHistoryRepository rescheduleRepository;

    // ======================== CRUD ========================

    /** Vazifalar ro'yxati — filtr, paginatsiya */
    @Transactional(readOnly = true)
    public PageResponse<PprTaskResponse> getAll(
            String status, String priority, Long equipmentId,
            Long assignedToId, Long pprTypeId,
            LocalDate dateFrom, LocalDate dateTo,
            String sortBy, String sortDir,
            int page, int size
    ) {
        Sort sort = Sort.by(
                "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy != null ? sortBy : "scheduledDate"
        );
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<PprTask> spec = notDeleted();
        if (status != null) spec = spec.and(byStatus(status));
        if (priority != null) spec = spec.and(byPriority(priority));
        if (equipmentId != null) spec = spec.and(byEquipmentId(equipmentId));
        if (assignedToId != null) spec = spec.and(byAssignedToId(assignedToId));
        if (pprTypeId != null) spec = spec.and(byPprTypeId(pprTypeId));
        if (dateFrom != null) spec = spec.and(dateAfter(dateFrom));
        if (dateTo != null) spec = spec.and(dateBefore(dateTo));

        Page<PprTask> result = taskRepository.findAll(spec, pageable);
        return PageResponse.<PprTaskResponse>builder()
                .content(result.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    /** Bitta vazifa */
    @Transactional(readOnly = true)
    public PprTaskResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    /** Kalendar uchun — sana oralig'ida vazifalar (TZ 3.1) */
    @Transactional(readOnly = true)
    public List<PprTaskResponse> getByDateRange(LocalDate from, LocalDate to) {
        return taskRepository.findAllByScheduledDateBetweenAndIsDeletedFalse(from, to)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Muddati o'tgan ishlar (TZ 3.7) */
    @Transactional(readOnly = true)
    public List<PprTaskResponse> getOverdue() {
        return taskRepository.findAllByScheduledDateBeforeAndStatusAndIsDeletedFalse(
                        LocalDate.now(), PprTask.TaskStatus.SCHEDULED)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Vazifa yaratish */
    @Transactional
    public PprTaskResponse create(PprTaskRequest request, User currentUser) {
        Equipment equipment = equipmentRepository.findByIdAndIsDeletedFalse(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Uskuna topilmadi"));
        PprType pprType = pprTypeRepository.findByIdAndIsDeletedFalse(request.getPprTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("PPR turi topilmadi"));

        PprTask task = PprTask.builder()
                .taskNumber(generateTaskNumber())
                .equipment(equipment)
                .pprType(pprType)
                .scheduledDate(request.getScheduledDate())
                .createdBy(currentUser)
                .description(request.getDescription())
                .build();

        // Ustuvorlik
        if (request.getPriority() != null) {
            task.setPriority(PprTask.TaskPriority.valueOf(request.getPriority()));
        }

        // Mas'ul shaxs
        if (request.getAssignedToId() != null) {
            task.setAssignedTo(responsiblePersonRepository.findByIdAndIsDeletedFalse(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mas'ul shaxs topilmadi")));
        }

        // Interval bog'lash
        if (request.getServiceIntervalId() != null) {
            task.setServiceInterval(serviceIntervalRepository.findByIdAndIsDeletedFalse(request.getServiceIntervalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Interval topilmadi")));
        }

        PprTask saved = taskRepository.save(task);

        // Chek-list shablondan nusxa olish (agar PPR turida shablon bo'lsa, keyinroq)
        log.info("PPR vazifa yaratildi: {} -> {}", saved.getTaskNumber(), equipment.getInventoryNumber());
        return toResponse(saved);
    }

    /** Vazifa tahrirlash */
    @Transactional
    public PprTaskResponse update(Long id, PprTaskRequest request) {
        PprTask task = findOrThrow(id);

        task.setScheduledDate(request.getScheduledDate());
        task.setDescription(request.getDescription());

        if (request.getPriority() != null) {
            task.setPriority(PprTask.TaskPriority.valueOf(request.getPriority()));
        }
        if (request.getAssignedToId() != null) {
            task.setAssignedTo(responsiblePersonRepository.findByIdAndIsDeletedFalse(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mas'ul shaxs topilmadi")));
        }
        if (request.getPprTypeId() != null) {
            task.setPprType(pprTypeRepository.findByIdAndIsDeletedFalse(request.getPprTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("PPR turi topilmadi")));
        }

        return toResponse(taskRepository.save(task));
    }

    /** Status o'zgartirish (TZ 3.4) */
    @Transactional
    public PprTaskResponse changeStatus(Long id, String newStatus, String completionNotes) {
        PprTask task = findOrThrow(id);
        PprTask.TaskStatus targetStatus = PprTask.TaskStatus.valueOf(newStatus);

        // Status oqimi tekshiruv
        validateStatusTransition(task.getStatus(), targetStatus);

        task.setStatus(targetStatus);

        if (targetStatus == PprTask.TaskStatus.COMPLETED) {
            task.setCompletedDate(LocalDate.now());
            task.setCompletionNotes(completionNotes);
            // Umumiy vaqtni hisoblash
            // (TimeEntry dan olinadi — keyingi qadamda)
        }

        return toResponse(taskRepository.save(task));
    }

    /** Vazifani boshqa sanaga ko'chirish (TZ 3.5) */
    @Transactional
    public PprTaskResponse reschedule(Long id, RescheduleRequest request, User currentUser) {
        PprTask task = findOrThrow(id);

        if (task.getStatus() != PprTask.TaskStatus.SCHEDULED) {
            throw new BadRequestException("Faqat rejalashtirilgan vazifalarni ko'chirish mumkin");
        }

        LocalDate oldDate = task.getScheduledDate();

        // Tarix saqlash
        TaskRescheduleHistory history = TaskRescheduleHistory.builder()
                .task(task)
                .oldDate(oldDate)
                .newDate(request.getNewDate())
                .reason(request.getReason())
                .rescheduledBy(currentUser)
                .build();
        rescheduleRepository.save(history);

        // Yangi sana
        task.setScheduledDate(request.getNewDate());
        log.info("Vazifa ko'chirildi: {} ({} -> {})", task.getTaskNumber(), oldDate, request.getNewDate());

        return toResponse(taskRepository.save(task));
    }

    /** Ko'chirish tarixi (TZ 3.5) */
    @Transactional(readOnly = true)
    public List<RescheduleHistoryResponse> getRescheduleHistory(Long taskId) {
        findOrThrow(taskId);
        return rescheduleRepository.findAllByTaskIdOrderByCreatedAtDesc(taskId)
                .stream().map(h -> {
                    RescheduleHistoryResponse r = new RescheduleHistoryResponse();
                    r.setId(h.getId());
                    r.setOldDate(h.getOldDate());
                    r.setNewDate(h.getNewDate());
                    r.setReason(h.getReason());
                    r.setCreatedAt(h.getCreatedAt());
                    if (h.getRescheduledBy() != null) {
                        r.setRescheduledByName(h.getRescheduledBy().getFullName());
                    }
                    return r;
                }).collect(Collectors.toList());
    }

    /** Soft delete */
    @Transactional
    public void delete(Long id) {
        PprTask task = findOrThrow(id);
        task.setIsDeleted(true);
        task.setDeletedAt(LocalDateTime.now());
        taskRepository.save(task);
    }

    // ======================== YORDAMCHI ========================

    private String generateTaskNumber() {
        long count = taskRepository.countAll() + 1;
        String number;
        do {
            number = String.format("PPR-%06d", count++);
        } while (taskRepository.existsByTaskNumberAndIsDeletedFalse(number));
        return number;
    }

    private void validateStatusTransition(PprTask.TaskStatus current, PprTask.TaskStatus target) {
        boolean valid = switch (current) {
            case SCHEDULED -> target == PprTask.TaskStatus.IN_PROGRESS;
            case IN_PROGRESS -> target == PprTask.TaskStatus.COMPLETED;
            case COMPLETED -> target == PprTask.TaskStatus.APPROVED;
            case APPROVED -> false;
        };
        if (!valid) {
            throw new BadRequestException(
                    String.format("Status o'tishi noto'g'ri: %s -> %s", current, target));
        }
    }

    private PprTask findOrThrow(Long id) {
        return taskRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vazifa topilmadi: " + id));
    }

    private PprTaskResponse toResponse(PprTask t) {
        PprTaskResponse r = new PprTaskResponse();
        r.setId(t.getId());
        r.setTaskNumber(t.getTaskNumber());
        r.setScheduledDate(t.getScheduledDate());
        r.setCompletedDate(t.getCompletedDate());
        r.setPriority(t.getPriority().name());
        r.setStatus(t.getStatus().name());
        r.setDescription(t.getDescription());
        r.setCompletionNotes(t.getCompletionNotes());
        r.setTimeSpentMinutes(t.getTimeSpentMinutes());
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());

        if (t.getEquipment() != null) {
            r.setEquipmentId(t.getEquipment().getId());
            r.setEquipmentName(t.getEquipment().getName());
            r.setEquipmentInventoryNumber(t.getEquipment().getInventoryNumber());
        }
        if (t.getPprType() != null) {
            r.setPprTypeId(t.getPprType().getId());
            r.setPprTypeName(t.getPprType().getNameUz());
        }
        if (t.getAssignedTo() != null) {
            r.setAssignedToId(t.getAssignedTo().getId());
            r.setAssignedToName(t.getAssignedTo().getFullName());
        }
        if (t.getCreatedBy() != null) {
            r.setCreatedByName(t.getCreatedBy().getFullName());
        }

        // TZ 3.7: muddati o'tganlik hisoblash
        if (t.getStatus() == PprTask.TaskStatus.SCHEDULED && t.getScheduledDate().isBefore(LocalDate.now())) {
            r.setIsOverdue(true);
            r.setOverdueDays((int) ChronoUnit.DAYS.between(t.getScheduledDate(), LocalDate.now()));
        } else {
            r.setIsOverdue(false);
            r.setOverdueDays(0);
        }

        return r;
    }

    // ======================== JPA SPECIFICATION ========================

    private Specification<PprTask> notDeleted() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }
    private Specification<PprTask> byStatus(String status) {
        return (root, query, cb) -> cb.equal(root.get("status"), PprTask.TaskStatus.valueOf(status));
    }
    private Specification<PprTask> byPriority(String priority) {
        return (root, query, cb) -> cb.equal(root.get("priority"), PprTask.TaskPriority.valueOf(priority));
    }
    private Specification<PprTask> byEquipmentId(Long id) {
        return (root, query, cb) -> cb.equal(root.get("equipment").get("id"), id);
    }
    private Specification<PprTask> byAssignedToId(Long id) {
        return (root, query, cb) -> cb.equal(root.get("assignedTo").get("id"), id);
    }
    private Specification<PprTask> byPprTypeId(Long id) {
        return (root, query, cb) -> cb.equal(root.get("pprType").get("id"), id);
    }
    private Specification<PprTask> dateAfter(LocalDate date) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("scheduledDate"), date);
    }
    private Specification<PprTask> dateBefore(LocalDate date) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("scheduledDate"), date);
    }

    // Inner DTO
    @lombok.Data
    public static class RescheduleHistoryResponse {
        private Long id;
        private LocalDate oldDate;
        private LocalDate newDate;
        private String reason;
        private String rescheduledByName;
        private LocalDateTime createdAt;
    }
}
