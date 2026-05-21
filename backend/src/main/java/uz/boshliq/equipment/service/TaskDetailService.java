package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import uz.boshliq.equipment.entity.*;
import uz.boshliq.equipment.exception.BadRequestException;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * TZ 3.9, 3.10, 3.11, 3.12: Vazifaga bog'liq xizmatlar.
 * - Chek-list bandlari
 * - Fotosuratlar (oldin/keyin)
 * - Izohlar
 * - Sarflangan vaqt
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TaskDetailService {

    private final PprTaskRepository taskRepository;
    private final TaskChecklistItemRepository checklistRepository;
    private final TaskCommentRepository commentRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final TaskPhotoRepository taskPhotoRepository;

    @Value("${app.upload.dir:/opt/app/uploads}")
    private String uploadDir;

    // ======================== CHEK-LIST (TZ 3.9) ========================

    /** Vazifa chek-list bandlari */
    public List<ChecklistItemDto> getChecklist(Long taskId) {
        checkTaskExists(taskId);
        return checklistRepository.findAllByTaskIdOrderBySortOrder(taskId)
                .stream().map(this::toChecklistDto).collect(Collectors.toList());
    }

    /** Chek-list bandi qo'shish */
    @Transactional
    public ChecklistItemDto addChecklistItem(Long taskId, String itemText, int sortOrder) {
        PprTask task = checkTaskExists(taskId);
        TaskChecklistItem item = TaskChecklistItem.builder()
                .task(task)
                .itemText(itemText)
                .sortOrder(sortOrder)
                .isCompleted(false)
                .build();
        return toChecklistDto(checklistRepository.save(item));
    }

    /** Chek-list bandini belgilash/bekor qilish */
    @Transactional
    public ChecklistItemDto toggleChecklistItem(Long itemId, String notes) {
        TaskChecklistItem item = checklistRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Band topilmadi"));
        item.setIsCompleted(!item.getIsCompleted());
        item.setCompletedAt(item.getIsCompleted() ? LocalDateTime.now() : null);

        // TZ 3.9: Bajarilmagan bandlar uchun izoh majburiy
        if (!item.getIsCompleted() && (notes == null || notes.isBlank())) {
            // Bekor qilishda izoh talab etilmaydi
        }
        if (notes != null) {
            item.setNotes(notes);
        }

        return toChecklistDto(checklistRepository.save(item));
    }

    // ======================== FOTOSURATLAR (TZ 3.10) ========================

    /** Vazifa fotosuratlar ro'yxati */
    public List<TaskPhotoDto> getPhotos(Long taskId) {
        checkTaskExists(taskId);
        return taskPhotoRepository.findAllByTaskIdOrderByCreatedAtDesc(taskId)
                .stream().map(this::toPhotoDto).collect(Collectors.toList());
    }

    /** Foto yuklash (oldin/keyin) */
    @Transactional
    public TaskPhotoDto uploadTaskPhoto(Long taskId, MultipartFile file, String type, User currentUser) {
        PprTask task = checkTaskExists(taskId);

        if (file.isEmpty()) {
            throw new BadRequestException("Fayl bo'sh");
        }

        // Fayl turini tekshirish
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Faqat rasm fayllar qabul qilinadi");
        }

        // Hajm tekshirish (max 10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("Fayl hajmi 10MB dan oshmasligi kerak");
        }

        // PhotoType aniqlash
        TaskPhoto.PhotoType photoType;
        try {
            photoType = TaskPhoto.PhotoType.valueOf(type.toUpperCase());
        } catch (Exception e) {
            photoType = TaskPhoto.PhotoType.BEFORE;
        }

        // Faylni saqlash
        String subDir = "ppr/" + taskId + "/" + photoType.name().toLowerCase();
        String ext = getFileExtension(file.getOriginalFilename());
        String uniqueName = UUID.randomUUID() + ext;

        Path dirPath = Paths.get(uploadDir, subDir);
        Path filePath = dirPath.resolve(uniqueName);

        try {
            Files.createDirectories(dirPath);
            file.transferTo(filePath.toFile());
        } catch (IOException e) {
            throw new BadRequestException("Faylni saqlashda xato: " + e.getMessage());
        }

        String relativePath = "/uploads/" + subDir + "/" + uniqueName;

        TaskPhoto photo = TaskPhoto.builder()
                .task(task)
                .photoType(photoType)
                .filePath(relativePath)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .uploadedBy(currentUser)
                .build();

        TaskPhoto saved = taskPhotoRepository.save(photo);
        log.info("PPR vazifa #{} uchun {} foto yuklandi: {}", taskId, photoType, relativePath);
        return toPhotoDto(saved);
    }

    /** Fotoni o'chirish */
    @Transactional
    public void deleteTaskPhoto(Long photoId) {
        TaskPhoto photo = taskPhotoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Foto topilmadi: " + photoId));

        // Faylni diskdan o'chirish
        try {
            Path filePath = Paths.get(uploadDir).resolve(photo.getFilePath().replaceFirst("^/uploads/", ""));
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Faylni o'chirishda xato: {}", e.getMessage());
        }

        taskPhotoRepository.delete(photo);
        log.info("PPR foto o'chirildi: #{}", photoId);
    }

    // ======================== IZOHLAR (TZ 3.11) ========================

    /** Vazifa izohlari */
    public List<CommentDto> getComments(Long taskId) {
        checkTaskExists(taskId);
        return commentRepository.findAllByTaskIdOrderByCreatedAtDesc(taskId)
                .stream().map(this::toCommentDto).collect(Collectors.toList());
    }

    /** Izoh qo'shish */
    @Transactional
    public CommentDto addComment(Long taskId, String commentText, User currentUser) {
        PprTask task = checkTaskExists(taskId);
        if (commentText == null || commentText.isBlank()) {
            throw new BadRequestException("Izoh matni kiritilishi shart");
        }
        TaskComment comment = TaskComment.builder()
                .task(task)
                .user(currentUser)
                .commentText(commentText)
                .build();
        return toCommentDto(commentRepository.save(comment));
    }

    // ======================== VAQT HISOBI (TZ 3.12) ========================

    /** Sarflangan vaqtlar */
    public List<TimeEntryDto> getTimeEntries(Long taskId) {
        checkTaskExists(taskId);
        return timeEntryRepository.findAllByTaskIdOrderByStartTimeDesc(taskId)
                .stream().map(this::toTimeEntryDto).collect(Collectors.toList());
    }

    /** Vaqt yozuvi qo'shish */
    @Transactional
    public TimeEntryDto addTimeEntry(Long taskId, LocalDateTime startTime, LocalDateTime endTime,
                                     Integer durationMinutes, String description, User currentUser) {
        PprTask task = checkTaskExists(taskId);

        // Agar endTime berilgan bo'lsa, avtomatik hisoblash
        if (endTime != null && durationMinutes == null) {
            durationMinutes = (int) java.time.Duration.between(startTime, endTime).toMinutes();
        }

        TimeEntry entry = TimeEntry.builder()
                .task(task)
                .user(currentUser)
                .startTime(startTime)
                .endTime(endTime)
                .durationMinutes(durationMinutes)
                .description(description)
                .build();
        TimeEntry saved = timeEntryRepository.save(entry);

        // Umumiy vaqtni yangilash
        int totalMinutes = timeEntryRepository.sumDurationByTaskId(taskId);
        task.setTimeSpentMinutes(totalMinutes);
        taskRepository.save(task);

        return toTimeEntryDto(saved);
    }

    /** Umumiy sarflangan vaqt (daqiqalarda) */
    public int getTotalTimeSpent(Long taskId) {
        checkTaskExists(taskId);
        return timeEntryRepository.sumDurationByTaskId(taskId);
    }

    // ======================== YORDAMCHI ========================

    private PprTask checkTaskExists(Long taskId) {
        return taskRepository.findByIdAndIsDeletedFalse(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Vazifa topilmadi: " + taskId));
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) return ".jpg";
        int dot = fileName.lastIndexOf('.');
        return dot > 0 ? fileName.substring(dot) : ".jpg";
    }

    // DTO mapping
    private ChecklistItemDto toChecklistDto(TaskChecklistItem i) {
        ChecklistItemDto d = new ChecklistItemDto();
        d.setId(i.getId());
        d.setItemText(i.getItemText());
        d.setIsCompleted(i.getIsCompleted());
        d.setCompletedAt(i.getCompletedAt());
        d.setNotes(i.getNotes());
        d.setSortOrder(i.getSortOrder());
        return d;
    }

    private CommentDto toCommentDto(TaskComment c) {
        CommentDto d = new CommentDto();
        d.setId(c.getId());
        d.setCommentText(c.getCommentText());
        d.setAuthorName(c.getUser() != null ? c.getUser().getFullName() : null);
        d.setCreatedAt(c.getCreatedAt());
        if (c.getUser() != null) {
            d.setUserId(c.getUser().getId());
            d.setUserName(c.getUser().getFullName());
        }
        return d;
    }

    private TimeEntryDto toTimeEntryDto(TimeEntry t) {
        TimeEntryDto d = new TimeEntryDto();
        d.setId(t.getId());
        d.setStartTime(t.getStartTime());
        d.setEndTime(t.getEndTime());
        d.setDurationMinutes(t.getDurationMinutes());
        d.setDescription(t.getDescription());
        d.setCreatedAt(t.getCreatedAt());
        if (t.getUser() != null) {
            d.setUserId(t.getUser().getId());
            d.setUserName(t.getUser().getFullName());
        }
        return d;
    }

    private TaskPhotoDto toPhotoDto(TaskPhoto p) {
        TaskPhotoDto d = new TaskPhotoDto();
        d.setId(p.getId());
        d.setFilePath(p.getFilePath());
        d.setFileName(p.getFileName());
        d.setFileSize(p.getFileSize());
        d.setPhotoType(p.getPhotoType() != null ? p.getPhotoType().name() : null);
        d.setDescription(p.getDescription());
        d.setCreatedAt(p.getCreatedAt());
        if (p.getUploadedBy() != null) {
            d.setUploadedByName(p.getUploadedBy().getFullName());
        }
        return d;
    }

    // Inner DTOs
    @lombok.Data
    public static class ChecklistItemDto {
        private Long id;
        private String itemText;
        private Boolean isCompleted;
        private LocalDateTime completedAt;
        private String notes;
        private Integer sortOrder;
    }

    @lombok.Data
    public static class CommentDto {
        private Long id;
        private Long userId;
        private String userName;
        private String authorName; // mobil ilova uchun alias
        private String commentText;
        private LocalDateTime createdAt;
    }

    @lombok.Data
    public static class TimeEntryDto {
        private Long id;
        private Long userId;
        private String userName;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Integer durationMinutes;
        private String description;
        private LocalDateTime createdAt;
    }

    @lombok.Data
    public static class TaskPhotoDto {
        private Long id;
        private String filePath;
        private String fileName;
        private Long fileSize;
        private String photoType; // BEFORE / AFTER
        private String description;
        private String uploadedByName;
        private LocalDateTime createdAt;
    }
}

