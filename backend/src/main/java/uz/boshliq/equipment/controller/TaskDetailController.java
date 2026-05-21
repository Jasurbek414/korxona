package uz.boshliq.equipment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import uz.boshliq.equipment.entity.User;
import uz.boshliq.equipment.service.TaskDetailService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * TZ 3.9, 3.10, 3.11, 3.12: Vazifa tafsilotlari API.
 */
@RestController
@RequestMapping("/api/v1/ppr/tasks/{taskId}")
@RequiredArgsConstructor
public class TaskDetailController {

    private final TaskDetailService service;

    // ====== Chek-list (TZ 3.9) ======

    @GetMapping("/checklist")
    public ResponseEntity<List<TaskDetailService.ChecklistItemDto>> getChecklist(@PathVariable Long taskId) {
        return ResponseEntity.ok(service.getChecklist(taskId));
    }

    @PostMapping("/checklist")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<TaskDetailService.ChecklistItemDto> addChecklistItem(
            @PathVariable Long taskId, @RequestBody Map<String, Object> body
    ) {
        String itemText = (String) body.get("itemText");
        int sortOrder = body.containsKey("sortOrder") ? ((Number) body.get("sortOrder")).intValue() : 0;
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addChecklistItem(taskId, itemText, sortOrder));
    }

    @PatchMapping("/checklist/{itemId}/toggle")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<TaskDetailService.ChecklistItemDto> toggleChecklistItem(
            @PathVariable Long taskId, @PathVariable Long itemId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String notes = body != null ? body.get("notes") : null;
        return ResponseEntity.ok(service.toggleChecklistItem(itemId, notes));
    }

    // ====== Fotosuratlar (TZ 3.10) ======

    @GetMapping("/photos")
    public ResponseEntity<List<TaskDetailService.TaskPhotoDto>> getPhotos(@PathVariable Long taskId) {
        return ResponseEntity.ok(service.getPhotos(taskId));
    }

    @PostMapping("/photos")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<TaskDetailService.TaskPhotoDto> uploadPhoto(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "BEFORE") String type,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.uploadTaskPhoto(taskId, file, type, currentUser));
    }

    @DeleteMapping("/photos/{photoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Void> deletePhoto(@PathVariable Long taskId, @PathVariable Long photoId) {
        service.deleteTaskPhoto(photoId);
        return ResponseEntity.noContent().build();
    }

    // ====== Izohlar (TZ 3.11) ======

    @GetMapping("/comments")
    public ResponseEntity<List<TaskDetailService.CommentDto>> getComments(@PathVariable Long taskId) {
        return ResponseEntity.ok(service.getComments(taskId));
    }

    @PostMapping("/comments")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<TaskDetailService.CommentDto> addComment(
            @PathVariable Long taskId, @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.addComment(taskId, body.get("commentText"), currentUser));
    }

    // ====== Vaqt hisobi (TZ 3.12) ======

    @GetMapping("/time-entries")
    public ResponseEntity<List<TaskDetailService.TimeEntryDto>> getTimeEntries(@PathVariable Long taskId) {
        return ResponseEntity.ok(service.getTimeEntries(taskId));
    }

    @PostMapping("/time-entries")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<TaskDetailService.TimeEntryDto> addTimeEntry(
            @PathVariable Long taskId, @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User currentUser
    ) {
        LocalDateTime startTime = LocalDateTime.parse((String) body.get("startTime"));
        LocalDateTime endTime = body.get("endTime") != null ? LocalDateTime.parse((String) body.get("endTime")) : null;
        Integer durationMinutes = body.get("durationMinutes") != null ? ((Number) body.get("durationMinutes")).intValue() : null;
        String description = (String) body.get("description");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.addTimeEntry(taskId, startTime, endTime, durationMinutes, description, currentUser));
    }

    @GetMapping("/total-time")
    public ResponseEntity<Map<String, Integer>> getTotalTime(@PathVariable Long taskId) {
        return ResponseEntity.ok(Map.of("totalMinutes", service.getTotalTimeSpent(taskId)));
    }
}
