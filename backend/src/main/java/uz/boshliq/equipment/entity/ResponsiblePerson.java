package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Mas'ul shaxslar (responsible_persons).
 * Uskuna yoki PPR vazifasiga tayinlanadigan shaxs.
 */
@Entity
@Table(name = "responsible_persons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponsiblePerson extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "position", length = 100)
    private String position;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 100)
    private String email;
}
