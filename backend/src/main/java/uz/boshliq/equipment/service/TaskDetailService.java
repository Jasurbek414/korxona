package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.entity.*;
import uz.boshliq.equipment.exception.BadRequestException;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * TZ 3.9, 3.11, 3.12: Vazifaga bog'liq xizmatlar.
 * - Chek-list bandlari
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
}
