package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Uskuna modellari (models).
 * Ishlab chiqaruvchiga bog'langan.
 * Masalan: HP LaserJet Pro M404dn
 */
@Entity
@Table(name = "models")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Model extends BaseEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manufacturer_id")
    private Manufacturer manufacturer;
}
