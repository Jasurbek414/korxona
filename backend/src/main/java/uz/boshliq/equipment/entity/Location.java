package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Joylashuvlar (locations).
 * Masalan: Bosh ofis, 2-qavat, 205-xona
 */
@Entity
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location extends BaseEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "building", length = 100)
    private String building;

    @Column(name = "floor", length = 20)
    private String floor;

    @Column(name = "room", length = 50)
    private String room;
}
