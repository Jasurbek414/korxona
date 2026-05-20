package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * TZ 4.2: Omborlar.
 */
@Entity
@Table(name = "warehouses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Warehouse extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 300)
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsible_person_id")
    private ResponsiblePerson responsiblePerson;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
