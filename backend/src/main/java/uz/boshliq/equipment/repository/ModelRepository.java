package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.boshliq.equipment.entity.Model;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModelRepository extends JpaRepository<Model, Long> {
    List<Model> findAllByIsDeletedFalseOrderByNameAsc();
    List<Model> findAllByManufacturerIdAndIsDeletedFalseOrderByNameAsc(Long manufacturerId);
    Optional<Model> findByIdAndIsDeletedFalse(Long id);
}
