package uz.boshliq.equipment.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.boshliq.equipment.entity.Equipment;
import uz.boshliq.equipment.exception.BadRequestException;
import uz.boshliq.equipment.exception.ResourceNotFoundException;
import uz.boshliq.equipment.repository.EquipmentRepository;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * TZ 2.12: QR-kod xizmati.
 * - QR-kodda JSON: {"type":"equipment","id":123}
 * - PNG formatda generatsiya
 * - Yuklab olish imkoniyati
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QrCodeService {

    private final EquipmentRepository equipmentRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final int QR_WIDTH = 300;
    private static final int QR_HEIGHT = 300;

    /**
     * Bitta uskuna uchun QR-kod yaratish va saqlash.
     * @param equipmentId uskuna ID
     * @return saqlangan QR-kod fayl yo'li
     */
    @Transactional
    public String generateQrCode(Long equipmentId) {
        Equipment equipment = equipmentRepository.findByIdAndIsDeletedFalse(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Uskuna topilmadi: " + equipmentId));

        // TZ: JSON formatda kodlash
        String qrContent = String.format("{\"type\":\"equipment\",\"id\":%d}", equipmentId);

        try {
            // QR-kod generatsiya
            byte[] qrBytes = generateQrImage(qrContent);

            // Faylni saqlash
            String subDir = "equipment/" + equipmentId;
            Path directory = Paths.get(uploadDir).resolve(subDir);
            Files.createDirectories(directory);

            String fileName = "qr_" + equipment.getInventoryNumber() + ".png";
            Path filePath = directory.resolve(fileName);
            Files.write(filePath, qrBytes);

            // DB da yo'lni saqlash
            String relativePath = subDir + "/" + fileName;
            equipment.setQrCodePath(relativePath);
            equipmentRepository.save(equipment);

            log.info("QR-kod yaratildi: uskuna {} ({})", equipmentId, equipment.getInventoryNumber());
            return relativePath;

        } catch (WriterException | IOException e) {
            throw new BadRequestException("QR-kod yaratishda xato: " + e.getMessage());
        }
    }

    /**
     * QR-kod rasmini byte[] sifatida olish (yuklab olish uchun).
     */
    public byte[] getQrCodeImage(Long equipmentId) {
        equipmentRepository.findByIdAndIsDeletedFalse(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Uskuna topilmadi: " + equipmentId));

        String qrContent = String.format("{\"type\":\"equipment\",\"id\":%d}", equipmentId);

        try {
            return generateQrImage(qrContent);
        } catch (WriterException | IOException e) {
            throw new BadRequestException("QR-kod yaratishda xato: " + e.getMessage());
        }
    }

    /**
     * Bir nechta uskuna uchun QR-kodlarni generatsiya qilish.
     * @param equipmentIds uskuna ID lari ro'yxati
     */
    @Transactional
    public void generateBulkQrCodes(java.util.List<Long> equipmentIds) {
        for (Long id : equipmentIds) {
            try {
                generateQrCode(id);
            } catch (Exception e) {
                log.error("QR-kod yaratishda xato (ID: {}): {}", id, e.getMessage());
            }
        }
    }

    /**
     * QR-kod rasmini yaratish.
     */
    private byte[] generateQrImage(String content) throws WriterException, IOException {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 2);

        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, QR_WIDTH, QR_HEIGHT, hints);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", outputStream);
        return outputStream.toByteArray();
    }
}
