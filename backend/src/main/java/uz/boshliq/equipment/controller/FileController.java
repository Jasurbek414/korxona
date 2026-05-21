package uz.boshliq.equipment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import uz.boshliq.equipment.dto.DocumentResponse;
import uz.boshliq.equipment.dto.PhotoResponse;
import uz.boshliq.equipment.entity.User;
import uz.boshliq.equipment.service.FileService;

import java.util.List;

/**
 * TZ 2.11: Hujjatlar va fotosuratlar API.
 */
@RestController
@RequestMapping("/api/v1/equipment/{equipmentId}")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    // ======================== HUJJATLAR ========================

    /** Uskuna hujjatlari ro'yxati */
    @GetMapping("/documents")
    public ResponseEntity<List<DocumentResponse>> getDocuments(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(fileService.getDocuments(equipmentId));
    }

    /** Hujjat yuklash */
    @PostMapping("/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @PathVariable Long equipmentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "documentTypeId", required = false) Long documentTypeId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fileService.uploadDocument(equipmentId, file, name, documentTypeId, currentUser));
    }

    /** Hujjatni o'chirish */
    @DeleteMapping("/documents/{documentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long equipmentId,
                                               @PathVariable Long documentId) {
        fileService.deleteDocument(documentId);
        return ResponseEntity.noContent().build();
    }

    /** Hujjat faylni yuklab olish */
    @GetMapping("/documents/{documentId}/file")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long equipmentId,
                                                     @PathVariable Long documentId) {
        return fileService.getDocumentFile(documentId);
    }

    // ======================== FOTOSURATLAR ========================

    /** Uskuna fotosuratlar galereyasi */
    @GetMapping("/photos")
    public ResponseEntity<List<PhotoResponse>> getPhotos(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(fileService.getPhotos(equipmentId));
    }

    /** Foto yuklash */
    @PostMapping("/photos")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<PhotoResponse> uploadPhoto(
            @PathVariable Long equipmentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fileService.uploadPhoto(equipmentId, file, description, currentUser));
    }

    /** Fotoni o'chirish */
    @DeleteMapping("/photos/{photoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Void> deletePhoto(@PathVariable Long equipmentId,
                                            @PathVariable Long photoId) {
        fileService.deletePhoto(photoId);
        return ResponseEntity.noContent().build();
    }

    /** Foto faylni ko'rsatish (image serve) */
    @GetMapping("/photos/{photoId}/file")
    public ResponseEntity<Resource> getPhotoFile(@PathVariable Long equipmentId,
                                                 @PathVariable Long photoId) {
        return fileService.getPhotoFile(photoId);
    }
}

