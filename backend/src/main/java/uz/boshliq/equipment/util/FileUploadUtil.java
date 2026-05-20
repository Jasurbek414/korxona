package uz.boshliq.equipment.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import uz.boshliq.equipment.exception.BadRequestException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

/**
 * Fayl yuklash uchun yordamchi sinf.
 * TZ 2.11 talablari:
 * - Ruxsat etilgan formatlar: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG
 * - Bitta fayl hajmi: max 10 MB
 * - Fayl nomiga UUID qo'shiladi
 */
@Component
public class FileUploadUtil {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.upload.max-file-size}")
    private long maxFileSize;

    /** Hujjatlar uchun ruxsat etilgan formatlar */
    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    /** Rasmlar uchun ruxsat etilgan formatlar */
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png"
    );

    /**
     * Hujjat faylni tekshirish va saqlash.
     * @param file yuklangan fayl
     * @param subDir papka yo'li (masalan: "equipment/5/documents")
     * @return saqlangan faylning nisbiy yo'li
     */
    public String saveDocument(MultipartFile file, String subDir) {
        validateFile(file, ALLOWED_DOCUMENT_TYPES, "Ruxsat etilgan formatlar: PDF, DOC, DOCX, XLS, XLSX");
        return saveFile(file, subDir);
    }

    /**
     * Rasm faylni tekshirish va saqlash.
     * @param file yuklangan fayl
     * @param subDir papka yo'li (masalan: "equipment/5/photos")
     * @return saqlangan faylning nisbiy yo'li
     */
    public String saveImage(MultipartFile file, String subDir) {
        validateFile(file, ALLOWED_IMAGE_TYPES, "Ruxsat etilgan formatlar: JPG, JPEG, PNG");
        return saveFile(file, subDir);
    }

    /**
     * Faylni o'chirish.
     */
    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(uploadDir).resolve(filePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            // Fayl o'chirilmasa ham xato bermaymiz, faqat log yozamiz
        }
    }

    /**
     * Fayl hajmi va turini tekshirish.
     */
    private void validateFile(MultipartFile file, Set<String> allowedTypes, String errorMessage) {
        if (file.isEmpty()) {
            throw new BadRequestException("Fayl bo'sh");
        }
        if (file.getSize() > maxFileSize) {
            throw new BadRequestException("Fayl hajmi " + (maxFileSize / 1024 / 1024) + " MB dan oshmasligi kerak");
        }
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            throw new BadRequestException(errorMessage);
        }
    }

    /**
     * Faylni diskka saqlash.
     */
    private String saveFile(MultipartFile file, String subDir) {
        try {
            // UUID bilan yagona nom yaratish
            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String uniqueName = UUID.randomUUID().toString() + extension;

            // Papkani yaratish
            Path directory = Paths.get(uploadDir).resolve(subDir);
            Files.createDirectories(directory);

            // Faylni saqlash
            Path filePath = directory.resolve(uniqueName);
            Files.copy(file.getInputStream(), filePath);

            // Nisbiy yo'lni qaytarish (DB da saqlanadi)
            return subDir + "/" + uniqueName;
        } catch (IOException e) {
            throw new BadRequestException("Faylni saqlashda xato: " + e.getMessage());
        }
    }
}
