package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * TZ 3.10: Vazifa fotosuratlar (oldin/keyin).
 */
@Entity
@Table(name = "task_photos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TaskPhoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private PprTask task;

    @Column(name = "photo_type", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PhotoType photoType = PhotoType.BEFORE;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(length = 300)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id")
    private User uploadedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public enum PhotoType { BEFORE, AFTER }
}
