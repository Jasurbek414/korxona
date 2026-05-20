package uz.boshliq.equipment.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Fotosurat javob DTO si.
 */
@Data
public class PhotoResponse {
    private Long id;
    private Long equipmentId;
    private String filePath;
    private String fileName;
    private Long fileSize;
    private String description;
    private String uploadedByName;
    private LocalDateTime createdAt;
}
