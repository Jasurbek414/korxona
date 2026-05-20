package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * PPR turi ma'lumotnomasi (Texnik ko'rik, Moylash, Kapital ta'mir va h.k.)
 */
@Entity
@Table(name = "ppr_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PprType extends BaseEntity {
    @Column(name = "name_uz", nullable = false, length = 100)
    private String nameUz;

    @Column(name = "name_ru", length = 100)
    private String nameRu;

    @Column(columnDefinition = "TEXT")
    private String description;
}
