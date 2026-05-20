package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Uskuna fotosuratlar (photos).
 * Uskuna kartochkasidagi foto galereya.
 */
@Entity
@Table(name = "photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Photo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_name", length = 200)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "description", length = 300)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;
}
