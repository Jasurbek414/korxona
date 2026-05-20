package uz.boshliq.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.boshliq.equipment.entity.ResponsiblePerson;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResponsiblePersonRepository extends JpaRepository<ResponsiblePerson, Long> {
    List<ResponsiblePerson> findAllByIsDeletedFalseOrderByFullNameAsc();
    Optional<ResponsiblePerson> findByIdAndIsDeletedFalse(Long id);
}
