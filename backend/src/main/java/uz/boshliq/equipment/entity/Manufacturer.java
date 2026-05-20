package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Ishlab chiqaruvchilar (manufacturers).
 * Masalan: HP, Dell, Lenovo, Samsung
 */
@Entity
@Table(name = "manufacturers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Manufacturer extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "country", length = 100)
    private String country;
}
