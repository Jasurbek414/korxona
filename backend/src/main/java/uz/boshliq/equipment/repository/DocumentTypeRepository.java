package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.boshliq.equipment.entity.DocumentType;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentTypeRepository extends JpaRepository<DocumentType, Long> {
    List<DocumentType> findAllByIsDeletedFalseOrderByNameUzAsc();
    Optional<DocumentType> findByIdAndIsDeletedFalse(Long id);
}
