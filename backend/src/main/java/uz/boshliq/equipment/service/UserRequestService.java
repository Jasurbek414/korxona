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

import java.time.LocalDateTime;
import java.util.Map;

/**
 * TZ 3.8: Foydalanuvchi arizalari xizmati.
 * Ariza holati: NEW → REVIEWING → APPROVED → COMPLETED → REJECTED
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserRequestService {

    private final UserRequestRepository requestRepository;
    private final EquipmentRepository equipmentRepository;

    /** Barcha arizalar (admin uchun) */
    @Transactional(readOnly = true)
    public Page<UserRequestDto> getAll(int page, int size) {
        return requestRepository.findAllByIsDeletedFalseOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(this::toDto);
    }

    /** Foydalanuvchi o'z arizalari */
    @Transactional(readOnly = true)
    public Page<UserRequestDto> getByUser(Long userId, int page, int size) {
        return requestRepository.findAllByRequestedByIdAndIsDeletedFalseOrderByCreatedAtDesc(
                userId, PageRequest.of(page, size)).map(this::toDto);
    }

    /** Bitta ariza */
    @Transactional(readOnly = true)
    public UserRequestDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    /** Ariza yaratish */
    @Transactional
    public UserRequestDto create(Long equipmentId, String requestType, String description, User currentUser) {
        Equipment equipment = equipmentRepository.findByIdAndIsDeletedFalse(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Uskuna topilmadi"));

        UserRequest request = new UserRequest();
        request.setRequestNumber(generateRequestNumber());
        request.setEquipment(equipment);
        request.setRequestedBy(currentUser);
        request.setRequestType(UserRequest.RequestType.valueOf(requestType));
        request.setDescription(description);
        request.setStatus(UserRequest.RequestStatus.NEW);

        log.info("Ariza yaratildi: {} -> {}", request.getRequestNumber(), equipment.getName());
        return toDto(requestRepository.save(request));
    }

    /** Ariza holatini o'zgartirish (admin) */
    @Transactional
    public UserRequestDto changeStatus(Long id, String newStatus, String responseNotes, User respondedBy) {
        UserRequest request = findOrThrow(id);
        UserRequest.RequestStatus target = UserRequest.RequestStatus.valueOf(newStatus);

        request.setStatus(target);
        request.setResponseNotes(responseNotes);
        request.setRespondedBy(respondedBy);
        request.setRespondedAt(LocalDateTime.now());

        log.info("Ariza {} statusi: {}", request.getRequestNumber(), newStatus);
        return toDto(requestRepository.save(request));
    }

    /** Soft delete */
    @Transactional
    public void delete(Long id) {
        UserRequest request = findOrThrow(id);
        request.setIsDeleted(true);
        request.setDeletedAt(LocalDateTime.now());
        requestRepository.save(request);
    }

    // ======================== YORDAMCHI ========================

    private String generateRequestNumber() {
        long count = requestRepository.count() + 1;
        return String.format("REQ-%06d", count);
    }

    private UserRequest findOrThrow(Long id) {
        return requestRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ariza topilmadi: " + id));
    }

    private UserRequestDto toDto(UserRequest r) {
        UserRequestDto d = new UserRequestDto();
        d.setId(r.getId());
        d.setRequestNumber(r.getRequestNumber());
        d.setRequestType(r.getRequestType().name());
        d.setStatus(r.getStatus().name());
        d.setDescription(r.getDescription());
        d.setResponseNotes(r.getResponseNotes());
        d.setCreatedAt(r.getCreatedAt());
        d.setRespondedAt(r.getRespondedAt());

        if (r.getEquipment() != null) {
            d.setEquipmentId(r.getEquipment().getId());
            d.setEquipmentName(r.getEquipment().getName());
        }
        if (r.getRequestedBy() != null) {
            d.setRequestedById(r.getRequestedBy().getId());
            d.setRequestedByName(r.getRequestedBy().getFullName());
        }
        if (r.getRespondedBy() != null) {
            d.setRespondedByName(r.getRespondedBy().getFullName());
        }
        return d;
    }

    @lombok.Data
    public static class UserRequestDto {
        private Long id;
        private String requestNumber;
        private Long equipmentId;
        private String equipmentName;
        private Long requestedById;
        private String requestedByName;
        private String requestType;
        private String status;
        private String description;
        private String responseNotes;
        private String respondedByName;
        private LocalDateTime respondedAt;
        private LocalDateTime createdAt;
    }
}
