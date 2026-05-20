package uz.boshliq.equipment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import uz.boshliq.equipment.entity.User;
import uz.boshliq.equipment.service.UserRequestService;

import java.util.Map;

/**
 * TZ 3.8: Foydalanuvchi arizalari API.
 */
@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
public class UserRequestController {

    private final UserRequestService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserRequestService.UserRequestDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(service.getAll(page, size));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<UserRequestService.UserRequestDto>> getMyRequests(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(service.getByUser(user.getId(), page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserRequestService.UserRequestDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<UserRequestService.UserRequestDto> create(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(
                ((Number) body.get("equipmentId")).longValue(),
                (String) body.get("requestType"),
                (String) body.get("description"),
                user
        ));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserRequestService.UserRequestDto> changeStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(service.changeStatus(id, body.get("status"), body.get("responseNotes"), user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
