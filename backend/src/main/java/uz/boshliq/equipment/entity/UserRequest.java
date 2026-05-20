package uz.boshliq.equipment.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * TZ 3.8: Foydalanuvchi arizalari.
 * Turi: REPAIR (ta'mir), REPLACE (almashtirish), OTHER (boshqa)
 * Status: NEW → REVIEWING → APPROVED → COMPLETED → REJECTED
 */
@Entity
@Table(name = "user_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserRequest extends BaseEntity {

    @Column(name = "request_number", nullable = false, unique = true, length = 30)
    private String requestNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_id", nullable = false)
    private User requestedBy;

    @Column(name = "request_type", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private RequestType requestType;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.NEW;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "response_notes", columnDefinition = "TEXT")
    private String responseNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responded_by_id")
    private User respondedBy;

    @Column(name = "responded_at")
    private java.time.LocalDateTime respondedAt;

    public enum RequestType { REPAIR, REPLACE, OTHER }
    public enum RequestStatus { NEW, REVIEWING, APPROVED, COMPLETED, REJECTED }
}
