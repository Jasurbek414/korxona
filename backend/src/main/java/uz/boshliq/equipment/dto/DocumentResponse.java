package uz.boshliq.equipment.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Hujjat javob DTO si.
 */
@Data
public class DocumentResponse {
    private Long id;
    private Long equipmentId;
    private Long documentTypeId;
    private String documentTypeName;
    private String name;
    private String filePath;
    private Long fileSize;
    private String contentType;
    private String uploadedByName;
    private LocalDateTime createdAt;
}
