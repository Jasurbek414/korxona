package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Uskuna statuslari.
 * Masalan: Ishlamoqda (yashil), Ta'mirda (sariq), Buzilgan (qizil)
 */
@Entity
@Table(name = "statuses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Status extends BaseEntity {

    @Column(name = "name_uz", nullable = false, length = 50)
    private String nameUz;

    @Column(name = "name_ru", length = 50)
    private String nameRu;

    @Column(name = "color", length = 20)
    private String color;

    @Column(name = "description", length = 300)
    private String description;
}
