package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.entity.*;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * TZ 3.2-3.3: Xizmat ko'rsatish intervallari va avtomatik vazifa yaratish.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceIntervalService {

    private final ServiceIntervalRepository intervalRepository;
    private final EquipmentRepository equipmentRepository;
    private final PprTypeRepository pprTypeRepository;
    private final CategoryRepository categoryRepository;
    private final PprTaskRepository taskRepository;
    private final ResponsiblePersonRepository responsiblePersonRepository;

    // ======================== CRUD ========================

    public List<IntervalResponse> getAll() {
        return intervalRepository.findAllByIsDeletedFalseAndIsActiveTrue()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<IntervalResponse> getByEquipment(Long equipmentId) {
        return intervalRepository.findAllByEquipmentIdAndIsDeletedFalse(equipmentId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public IntervalResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public IntervalResponse create(IntervalRequest request) {
        ServiceInterval interval = ServiceInterval.builder()
                .intervalDays(request.getIntervalDays())
                .description(request.getDescription())
                .build();

        // Uskuna yoki toifa bog'lash
        if (request.getEquipmentId() != null) {
            interval.setEquipment(equipmentRepository.findByIdAndIsDeletedFalse(request.getEquipmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Uskuna topilmadi")));
        }
        if (request.getCategoryId() != null) {
            interval.setCategory(categoryRepository.findByIdAndIsDeletedFalse(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Toifa topilmadi")));
        }
        interval.setPprType(pprTypeRepository.findByIdAndIsDeletedFalse(request.getPprTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("PPR turi topilmadi")));

        // Birinchi next_due_date ni hisoblash
        interval.setNextDueDate(LocalDate.now().plusDays(request.getIntervalDays()));

        return toResponse(intervalRepository.save(interval));
    }

    @Transactional
    public IntervalResponse update(Long id, IntervalRequest request) {
        ServiceInterval interval = findOrThrow(id);
        interval.setIntervalDays(request.getIntervalDays());
        interval.setDescription(request.getDescription());
        // next_due_date ni qayta hisoblash
        if (interval.getLastExecutedDate() != null) {
            interval.setNextDueDate(interval.getLastExecutedDate().plusDays(request.getIntervalDays()));
        } else {
            interval.setNextDueDate(LocalDate.now().plusDays(request.getIntervalDays()));
        }
        return toResponse(intervalRepository.save(interval));
    }

    @Transactional
    public void delete(Long id) {
        ServiceInterval interval = findOrThrow(id);
        interval.setIsDeleted(true);
        interval.setDeletedAt(LocalDateTime.now());
        intervalRepository.save(interval);
    }

    // ======================== AVTOMATIK VAZIFA (TZ 3.3) ========================

    /**
     * Har kuni ishlaydigan scheduler chaqiradi.
     * next_due_date <= bugun bo'lgan intervallar uchun yangi vazifa yaratadi.
     */
    @Transactional
    public int generateScheduledTasks() {
        LocalDate today = LocalDate.now();
        List<ServiceInterval> dueIntervals = intervalRepository
                .findAllByNextDueDateLessThanEqualAndIsActiveTrueAndIsDeletedFalse(today);

        int created = 0;
        for (ServiceInterval interval : dueIntervals) {
            try {
                // Agar uskuna bo'lsa — bitta vazifa
                if (interval.getEquipment() != null) {
                    createTaskFromInterval(interval, interval.getEquipment());
                    created++;
                }
                // Agar toifa bo'lsa — shu toifadagi barcha uskunalar uchun
                else if (interval.getCategory() != null) {
                    List<Equipment> equipment = equipmentRepository
                            .findAllByCategoryIdAndIsDeletedFalse(interval.getCategory().getId());
                    for (Equipment eq : equipment) {
                        createTaskFromInterval(interval, eq);
                        created++;
                    }
                }

                // Keyingi muddatni belgilash
                interval.setLastExecutedDate(today);
                interval.setNextDueDate(today.plusDays(interval.getIntervalDays()));
                intervalRepository.save(interval);

            } catch (Exception e) {
                log.error("Interval {} uchun vazifa yaratishda xato: {}", interval.getId(), e.getMessage());
            }
        }

        if (created > 0) {
            log.info("Avtomatik {} ta PPR vazifa yaratildi", created);
        }
        return created;
    }

    private void createTaskFromInterval(ServiceInterval interval, Equipment equipment) {
        String taskNumber = generateTaskNumber();
        PprTask task = PprTask.builder()
                .taskNumber(taskNumber)
                .equipment(equipment)
                .pprType(interval.getPprType())
                .serviceInterval(interval)
                .scheduledDate(interval.getNextDueDate())
                .description(interval.getDescription())
                .build();

        // Agar uskunaning mas'ul shaxsi bo'lsa, tayinlash
        if (equipment.getResponsiblePerson() != null) {
            task.setAssignedTo(equipment.getResponsiblePerson());
        }

        taskRepository.save(task);
        log.debug("Avtomatik vazifa: {} -> {}", taskNumber, equipment.getInventoryNumber());
    }

    private String generateTaskNumber() {
        long count = taskRepository.countAll() + 1;
        String number;
        do {
            number = String.format("PPR-%06d", count++);
        } while (taskRepository.existsByTaskNumberAndIsDeletedFalse(number));
        return number;
    }

    // ======================== YORDAMCHI ========================

    private ServiceInterval findOrThrow(Long id) {
        return intervalRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interval topilmadi: " + id));
    }

    private IntervalResponse toResponse(ServiceInterval i) {
        IntervalResponse r = new IntervalResponse();
        r.setId(i.getId());
        r.setIntervalDays(i.getIntervalDays());
        r.setDescription(i.getDescription());
        r.setIsActive(i.getIsActive());
        r.setLastExecutedDate(i.getLastExecutedDate());
        r.setNextDueDate(i.getNextDueDate());
        if (i.getEquipment() != null) {
            r.setEquipmentId(i.getEquipment().getId());
            r.setEquipmentName(i.getEquipment().getName());
        }
        if (i.getCategory() != null) {
            r.setCategoryId(i.getCategory().getId());
            r.setCategoryName(i.getCategory().getNameUz());
        }
        if (i.getPprType() != null) {
            r.setPprTypeId(i.getPprType().getId());
            r.setPprTypeName(i.getPprType().getNameUz());
        }
        return r;
    }

    // Inner DTOs
    @lombok.Data
    public static class IntervalRequest {
        private Long equipmentId;
        private Long categoryId;
        private Long pprTypeId;
        private Integer intervalDays;
        private String description;
    }

    @lombok.Data
    public static class IntervalResponse {
        private Long id;
        private Long equipmentId;
        private String equipmentName;
        private Long categoryId;
        private String categoryName;
        private Long pprTypeId;
        private String pprTypeName;
        private Integer intervalDays;
        private String description;
        private Boolean isActive;
        private LocalDate lastExecutedDate;
        private LocalDate nextDueDate;
    }
}
