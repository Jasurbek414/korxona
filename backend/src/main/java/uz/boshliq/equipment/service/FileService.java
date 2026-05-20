package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import uz.boshliq.equipment.dto.DocumentResponse;
import uz.boshliq.equipment.dto.PhotoResponse;
import uz.boshliq.equipment.entity.*;
import uz.boshliq.equipment.exception.BadRequestException;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.*;
import uz.boshliq.equipment.util.FileUploadUtil;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * TZ 2.11: Hujjatlar va fotosuratlar xizmati.
 * - Bitta uskuna uchun max 20 ta hujjat va 30 ta foto
 * - Fayllar /uploads/equipment/{id}/documents/ va /uploads/equipment/{id}/photos/ da saqlanadi
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    private final DocumentRepository documentRepository;
    private final PhotoRepository photoRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final EquipmentRepository equipmentRepository;
    private final FileUploadUtil fileUploadUtil;

    private static final int MAX_DOCUMENTS_PER_EQUIPMENT = 20;
    private static final int MAX_PHOTOS_PER_EQUIPMENT = 30;

    // ======================== HUJJATLAR ========================

    /** Uskuna hujjatlarini olish */
    public List<DocumentResponse> getDocuments(Long equipmentId) {
        checkEquipmentExists(equipmentId);
        return documentRepository.findAllByEquipmentIdAndIsDeletedFalse(equipmentId)
                .stream().map(this::toDocResponse).collect(Collectors.toList());
    }

    /** Hujjat yuklash */
    @Transactional
    public DocumentResponse uploadDocument(Long equipmentId, MultipartFile file,
                                           String name, Long documentTypeId, User currentUser) {
        Equipment equipment = checkEquipmentExists(equipmentId);

        // Limit tekshiruv
        long count = documentRepository.countByEquipmentIdAndIsDeletedFalse(equipmentId);
        if (count >= MAX_DOCUMENTS_PER_EQUIPMENT) {
            throw new BadRequestException("Bitta uskuna uchun max " + MAX_DOCUMENTS_PER_EQUIPMENT + " ta hujjat ruxsat etiladi");
        }

        // Faylni saqlash
        String subDir = "equipment/" + equipmentId + "/documents";
        String filePath = fileUploadUtil.saveDocument(file, subDir);

        // DB ga yozish
        Document document = Document.builder()
                .equipment(equipment)
                .name(name != null ? name : file.getOriginalFilename())
                .filePath(filePath)
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .uploadedBy(currentUser)
                .build();

        if (documentTypeId != null) {
            DocumentType docType = documentTypeRepository.findByIdAndIsDeletedFalse(documentTypeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Hujjat turi topilmadi: " + documentTypeId));
            document.setDocumentType(docType);
        }

        Document saved = documentRepository.save(document);
        log.info("Hujjat yuklandi: {} -> uskuna {}", saved.getName(), equipmentId);
        return toDocResponse(saved);
    }

    /** Hujjatni o'chirish (soft delete) */
    @Transactional
    public void deleteDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .filter(d -> !d.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Hujjat topilmadi: " + documentId));
        document.setIsDeleted(true);
        document.setDeletedAt(LocalDateTime.now());
        documentRepository.save(document);
    }

    // ======================== FOTOSURATLAR ========================

    /** Uskuna fotosuratlarini olish */
    public List<PhotoResponse> getPhotos(Long equipmentId) {
        checkEquipmentExists(equipmentId);
        return photoRepository.findAllByEquipmentIdAndIsDeletedFalse(equipmentId)
                .stream().map(this::toPhotoResponse).collect(Collectors.toList());
    }

    /** Foto yuklash */
    @Transactional
    public PhotoResponse uploadPhoto(Long equipmentId, MultipartFile file,
                                     String description, User currentUser) {
        Equipment equipment = checkEquipmentExists(equipmentId);

        // Limit tekshiruv
        long count = photoRepository.countByEquipmentIdAndIsDeletedFalse(equipmentId);
        if (count >= MAX_PHOTOS_PER_EQUIPMENT) {
            throw new BadRequestException("Bitta uskuna uchun max " + MAX_PHOTOS_PER_EQUIPMENT + " ta foto ruxsat etiladi");
        }

        // Faylni saqlash
        String subDir = "equipment/" + equipmentId + "/photos";
        String filePath = fileUploadUtil.saveImage(file, subDir);

        // DB ga yozish
        Photo photo = Photo.builder()
                .equipment(equipment)
                .filePath(filePath)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .description(description)
                .uploadedBy(currentUser)
                .build();

        Photo saved = photoRepository.save(photo);
        log.info("Foto yuklandi: uskuna {}", equipmentId);
        return toPhotoResponse(saved);
    }

    /** Fotoni o'chirish (soft delete) */
    @Transactional
    public void deletePhoto(Long photoId) {
        Photo photo = photoRepository.findById(photoId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Foto topilmadi: " + photoId));
        photo.setIsDeleted(true);
        photo.setDeletedAt(LocalDateTime.now());
        photoRepository.save(photo);
    }

    // ======================== YORDAMCHI ========================

    private Equipment checkEquipmentExists(Long equipmentId) {
        return equipmentRepository.findByIdAndIsDeletedFalse(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Uskuna topilmadi: " + equipmentId));
    }

    private DocumentResponse toDocResponse(Document d) {
        DocumentResponse r = new DocumentResponse();
        r.setId(d.getId());
        r.setEquipmentId(d.getEquipment().getId());
        r.setName(d.getName());
        r.setFilePath(d.getFilePath());
        r.setFileSize(d.getFileSize());
        r.setContentType(d.getContentType());
        r.setCreatedAt(d.getCreatedAt());
        if (d.getDocumentType() != null) {
            r.setDocumentTypeId(d.getDocumentType().getId());
            r.setDocumentTypeName(d.getDocumentType().getNameUz());
        }
        if (d.getUploadedBy() != null) {
            r.setUploadedByName(d.getUploadedBy().getFullName());
        }
        return r;
    }

    private PhotoResponse toPhotoResponse(Photo p) {
        PhotoResponse r = new PhotoResponse();
        r.setId(p.getId());
        r.setEquipmentId(p.getEquipment().getId());
        r.setFilePath(p.getFilePath());
        r.setFileName(p.getFileName());
        r.setFileSize(p.getFileSize());
        r.setDescription(p.getDescription());
        r.setCreatedAt(p.getCreatedAt());
        if (p.getUploadedBy() != null) {
            r.setUploadedByName(p.getUploadedBy().getFullName());
        }
        return r;
    }
}
