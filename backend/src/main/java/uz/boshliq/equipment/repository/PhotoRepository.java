package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.boshliq.equipment.entity.Photo;

import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findAllByEquipmentIdAndIsDeletedFalse(Long equipmentId);
    long countByEquipmentIdAndIsDeletedFalse(Long equipmentId);
}
