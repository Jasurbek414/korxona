package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import uz.boshliq.equipment.dto.PageResponse;
import uz.boshliq.equipment.entity.AuditLog;
import uz.boshliq.equipment.entity.User;
import uz.boshliq.equipment.repository.AuditLogRepository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * TZ 5.4: Audit jurnali xizmati.
 * Barcha muhim amallar (kirish, yaratish, o'zgartirish, o'chirish) qayd etiladi.
 */
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository repository;

    /**
     * Harakat qayd etish — tizim ichidan avtomatik chaqiriladi.
     */
    public void log(User user, String action, String entityType, Long entityId,
                    String oldValue, String newValue, String ipAddress, String description) {
        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .ipAddress(ipAddress)
                .description(description)
                .build();
        repository.save(auditLog);
    }

    /** Qisqartirilgan — faqat oddiy harakat qayd etish */
    public void log(User user, String action, String entityType, Long entityId, String description) {
        log(user, action, entityType, entityId, null, null, null, description);
    }

    /**
     * Audit jurnalini ko'rish (paginatsiya bilan).
     */
    public PageResponse<AuditLogResponse> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> result = repository.findAllByOrderByCreatedAtDesc(pageable);
        return buildPage(result);
    }

    /**
     * Foydalanuvchi bo'yicha filtrlash.
     */
    public PageResponse<AuditLogResponse> getByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> result = repository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable);
        return buildPage(result);
    }

    /**
     * Harakat turi bo'yicha filtrlash.
     */
    public PageResponse<AuditLogResponse> getByAction(String action, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> result = repository.findAllByActionOrderByCreatedAtDesc(action, pageable);
        return buildPage(result);
    }

    private PageResponse<AuditLogResponse> buildPage(Page<AuditLog> result) {
        return PageResponse.<AuditLogResponse>builder()
                .content(result.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    private AuditLogResponse toResponse(AuditLog log) {
        AuditLogResponse r = new AuditLogResponse();
        r.setId(log.getId());
        r.setAction(log.getAction());
        r.setEntityType(log.getEntityType());
        r.setEntityId(log.getEntityId());
        r.setOldValue(log.getOldValue());
        r.setNewValue(log.getNewValue());
        r.setIpAddress(log.getIpAddress());
        r.setDescription(log.getDescription());
        r.setCreatedAt(log.getCreatedAt());
        if (log.getUser() != null) {
            r.setUserId(log.getUser().getId());
            r.setUserName(log.getUser().getFullName());
        }
        return r;
    }

    /**
     * Audit javob DTO (ichki sinf — soddalik uchun).
     */
    @lombok.Data
    public static class AuditLogResponse {
        private Long id;
        private Long userId;
        private String userName;
        private String action;
        private String entityType;
        private Long entityId;
        private String oldValue;
        private String newValue;
        private String ipAddress;
        private String description;
        private java.time.LocalDateTime createdAt;
    }
}
