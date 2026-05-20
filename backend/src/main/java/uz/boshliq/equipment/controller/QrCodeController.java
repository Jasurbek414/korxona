package uz.boshliq.equipment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uz.boshliq.equipment.service.QrCodeService;

import java.util.List;
import java.util.Map;

/**
 * TZ 2.12: QR-kod API.
 */
@RestController
@RequestMapping("/api/v1/equipment")
@RequiredArgsConstructor
public class QrCodeController {

    private final QrCodeService qrCodeService;

    /** Bitta uskuna uchun QR-kod generatsiya qilish va saqlash */
    @PostMapping("/{id}/qr-code/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Map<String, String>> generateQrCode(@PathVariable Long id) {
        String path = qrCodeService.generateQrCode(id);
        return ResponseEntity.ok(Map.of("qrCodePath", path));
    }

    /** QR-kod rasmini yuklab olish (PNG) */
    @GetMapping("/{id}/qr-code")
    public ResponseEntity<byte[]> downloadQrCode(@PathVariable Long id) {
        byte[] image = qrCodeService.getQrCodeImage(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=qr_" + id + ".png")
                .contentType(MediaType.IMAGE_PNG)
                .body(image);
    }

    /** Bir nechta uskuna uchun QR-kodlarni bir vaqtda yaratish */
    @PostMapping("/qr-code/bulk-generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> bulkGenerate(@RequestBody List<Long> equipmentIds) {
        qrCodeService.generateBulkQrCodes(equipmentIds);
        return ResponseEntity.ok(equipmentIds.size() + " ta uskuna uchun QR-kodlar yaratildi");
    }
}
