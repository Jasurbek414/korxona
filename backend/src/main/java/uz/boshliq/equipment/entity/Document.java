package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Uskuna hujjatlari (documents).
 * PDF, DOC, XLS va boshqa fayllarni uskuna kartochkasiga biriktirish.
 */
@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_type_id")
    private DocumentType documentType;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;
}
