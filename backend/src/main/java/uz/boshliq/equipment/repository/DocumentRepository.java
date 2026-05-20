package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.boshliq.equipment.entity.Document;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findAllByEquipmentIdAndIsDeletedFalse(Long equipmentId);
    long countByEquipmentIdAndIsDeletedFalse(Long equipmentId);
}
