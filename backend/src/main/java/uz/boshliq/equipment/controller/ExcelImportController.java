package uz.boshliq.equipment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import uz.boshliq.equipment.service.ExcelImportService;

/**
 * TZ 4.7: Excel import/export API.
 */
@RestController
@RequestMapping("/api/v1/import")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ExcelImportController {

    private final ExcelImportService service;

    /** Uskunalar import (TZ 4.7.1) */
    @PostMapping(value = "/equipment", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ExcelImportService.ImportResult> importEquipment(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(service.importEquipment(file));
    }

    /** Ehtiyot qismlar import (TZ 4.7.3) */
    @PostMapping(value = "/spare-parts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ExcelImportService.ImportResult> importSpareParts(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(service.importSpareParts(file));
    }

    /** Shablon yuklab olish */
    @GetMapping("/template/{type}")
    public ResponseEntity<byte[]> downloadTemplate(@PathVariable String type) {
        byte[] template = service.generateTemplate(type);
        String filename = type + "_shablon.xlsx";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(template);
    }
}
