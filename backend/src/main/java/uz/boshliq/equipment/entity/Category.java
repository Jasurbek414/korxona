package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Uskuna toifalari (categories).
 * Masalan: Kompyuter, Printer, Server, Tarmoq uskunasi
 */
@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends BaseEntity {

    @Column(name = "name_uz", nullable = false, length = 100)
    private String nameUz;

    @Column(name = "name_ru", length = 100)
    private String nameRu;

    @Column(name = "description", length = 500)
    private String description;
}
