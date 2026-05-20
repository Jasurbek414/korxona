package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

/** Ehtiyot qismlar toifasi */
@Entity
@Table(name = "spare_part_categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SparePartCategory extends BaseEntity {
    @Column(name = "name_uz", nullable = false, length = 100)
    private String nameUz;

    @Column(name = "name_ru", length = 100)
    private String nameRu;
}
