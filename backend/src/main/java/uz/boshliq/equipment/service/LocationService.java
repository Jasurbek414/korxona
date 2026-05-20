package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.dto.LocationDto;
import uz.boshliq.equipment.entity.Location;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.LocationRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository repository;

    public List<LocationDto> getAll() {
        return repository.findAllByIsDeletedFalseOrderByNameAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public LocationDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public LocationDto create(LocationDto dto) {
        Location entity = Location.builder()
                .name(dto.getName()).building(dto.getBuilding())
                .floor(dto.getFloor()).room(dto.getRoom()).build();
        return toDto(repository.save(entity));
    }

    @Transactional
    public LocationDto update(Long id, LocationDto dto) {
        Location entity = findOrThrow(id);
        entity.setName(dto.getName());
        entity.setBuilding(dto.getBuilding());
        entity.setFloor(dto.getFloor());
        entity.setRoom(dto.getRoom());
        return toDto(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        Location entity = findOrThrow(id);
        entity.setIsDeleted(true);
        entity.setDeletedAt(LocalDateTime.now());
        repository.save(entity);
    }

    private Location findOrThrow(Long id) {
        return repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Joylashuv topilmadi: " + id));
    }

    private LocationDto toDto(Location e) {
        LocationDto dto = new LocationDto();
        dto.setId(e.getId());
        dto.setName(e.getName());
        dto.setBuilding(e.getBuilding());
        dto.setFloor(e.getFloor());
        dto.setRoom(e.getRoom());
        return dto;
    }
}
