package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Hujjat turlari (document_types).
 * Masalan: Pasport, Kafolat xati, Ta'mirlash dalolatnomasi
 */
@Entity
@Table(name = "document_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentType extends BaseEntity {

    @Column(name = "name_uz", nullable = false, length = 100)
    private String nameUz;

    @Column(name = "name_ru", length = 100)
    private String nameRu;
}
