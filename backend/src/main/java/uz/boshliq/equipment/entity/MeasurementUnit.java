package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

/** O'lchov birliklari ma'lumotnomasi */
@Entity
@Table(name = "measurement_units")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MeasurementUnit extends BaseEntity {
    @Column(name = "name_uz", nullable = false, length = 50)
    private String nameUz;

    @Column(name = "name_ru", length = 50)
    private String nameRu;

    @Column(name = "short_name", nullable = false, length = 10)
    private String shortName;
}
