package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import uz.boshliq.equipment.entity.*;
import uz.boshliq.equipment.repository.*;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.*;

/**
 * TZ 4.7: Excel orqali import xizmati.
 * 3 tur: Uskunalar, PPR jadval, Ehtiyot qismlar.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelImportService {

    private final EquipmentRepository equipmentRepository;
    private final CategoryRepository categoryRepository;
    private final StatusRepository statusRepository;
    private final LocationRepository locationRepository;
    private final ResponsiblePersonRepository personRepository;
    private final SparePartRepository sparePartRepository;
    private final MeasurementUnitRepository unitRepository;
    private final PprTypeRepository pprTypeRepository;
    private final ServiceIntervalRepository intervalRepository;

    // ======================== 1. USKUNALAR IMPORT (TZ 4.7.1) ========================

    @Transactional
    public ImportResult importEquipment(MultipartFile file) {
        ImportResult result = new ImportResult();
        try (InputStream is = file.getInputStream(); Workbook wb = new XSSFWorkbook(is)) {
            Sheet sheet = wb.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // 0-qator = sarlavha
                Row row = sheet.getRow(i);
                if (row == null) continue;
                result.setTotal(result.getTotal() + 1);
                try {
                    String invNum = getCellString(row, 0);
                    String name = getCellString(row, 1);
                    String categoryName = getCellString(row, 2);
                    String serialNum = getCellString(row, 3);
                    String locationName = getCellString(row, 4);

                    if (invNum.isBlank() || name.isBlank()) {
                        result.addError(i + 1, "Inventar raqami va nomi majburiy");
                        continue;
                    }
                    if (equipmentRepository.existsByInventoryNumberAndIsDeletedFalse(invNum)) {
                        result.addError(i + 1, "Inventar raqami mavjud: " + invNum);
                        continue;
                    }

                    Equipment eq = new Equipment();
                    eq.setInventoryNumber(invNum);
                    eq.setName(name);
                    eq.setSerialNumber(serialNum);

                    // Toifani topish/yaratish
                    if (!categoryName.isBlank()) {
                        categoryRepository.findAllByIsDeletedFalseOrderByNameUzAsc().stream()
                                .filter(c -> c.getNameUz().equalsIgnoreCase(categoryName))
                                .findFirst().ifPresent(eq::setCategory);
                    }
                    // Joylashuvni topish
                    if (!locationName.isBlank()) {
                        locationRepository.findAllByIsDeletedFalseOrderByNameAsc().stream()
                                .filter(l -> l.getName().equalsIgnoreCase(locationName))
                                .findFirst().ifPresent(eq::setLocation);
                    }
                    // Default status
                    statusRepository.findAllByIsDeletedFalseOrderByNameUzAsc().stream()
                            .findFirst().ifPresent(eq::setStatus);

                    equipmentRepository.save(eq);
                    result.setSuccess(result.getSuccess() + 1);
                } catch (Exception e) {
                    result.addError(i + 1, e.getMessage());
                }
            }
        } catch (Exception e) {
            result.addError(0, "Faylni o'qishda xato: " + e.getMessage());
        }
        log.info("Excel import (uskunalar): jami={}, muvaffaqiyat={}, xato={}",
                result.getTotal(), result.getSuccess(), result.getErrors().size());
        return result;
    }

    // ======================== 2. EHTIYOT QISMLAR IMPORT (TZ 4.7.3) ========================

    @Transactional
    public ImportResult importSpareParts(MultipartFile file) {
        ImportResult result = new ImportResult();
        try (InputStream is = file.getInputStream(); Workbook wb = new XSSFWorkbook(is)) {
            Sheet sheet = wb.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                result.setTotal(result.getTotal() + 1);
                try {
                    String name = getCellString(row, 0);
                    String code = getCellString(row, 1);
                    String unitName = getCellString(row, 2);
                    double price = getCellNumber(row, 3);
                    int minStock = (int) getCellNumber(row, 4);

                    if (name.isBlank() || code.isBlank()) {
                        result.addError(i + 1, "Nomi va kodi majburiy");
                        continue;
                    }
                    if (sparePartRepository.existsByCodeAndIsDeletedFalse(code)) {
                        result.addError(i + 1, "Kod mavjud: " + code);
                        continue;
                    }

                    SparePart sp = new SparePart();
                    sp.setName(name);
                    sp.setCode(code);
                    sp.setPrice(java.math.BigDecimal.valueOf(price));
                    sp.setMinStock(minStock);

                    if (!unitName.isBlank()) {
                        unitRepository.findAllByIsDeletedFalse().stream()
                                .filter(u -> u.getShortName().equalsIgnoreCase(unitName) || u.getNameUz().equalsIgnoreCase(unitName))
                                .findFirst().ifPresent(sp::setUnit);
                    }

                    sparePartRepository.save(sp);
                    result.setSuccess(result.getSuccess() + 1);
                } catch (Exception e) {
                    result.addError(i + 1, e.getMessage());
                }
            }
        } catch (Exception e) {
            result.addError(0, "Faylni o'qishda xato: " + e.getMessage());
        }
        log.info("Excel import (ehtiyot qismlar): jami={}, muvaffaqiyat={}, xato={}",
                result.getTotal(), result.getSuccess(), result.getErrors().size());
        return result;
    }

    // ======================== SHABLON YARATISH ========================

    public byte[] generateTemplate(String type) {
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Ma'lumotlar");
            Row header = sheet.createRow(0);

            CellStyle headerStyle = wb.createCellStyle();
            Font font = wb.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            String[] columns = switch (type) {
                case "equipment" -> new String[]{"Inventar raqami*", "Nomi*", "Toifasi", "Seriya raqami", "Joylashuv"};
                case "spare-parts" -> new String[]{"Nomi*", "Kodi*", "O'lchov birligi", "Narxi", "Minimal qoldiq"};
                case "ppr-schedule" -> new String[]{"Uskuna inventar raqami*", "PPR turi*", "Interval (kun)*", "Tavsif"};
                default -> new String[]{"Ma'lumot"};
            };

            for (int i = 0; i < columns.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 6000);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Shablon yaratishda xato", e);
        }
    }

    // ======================== YORDAMCHI ========================

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> "";
        };
    }

    private double getCellNumber(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return 0;
        return switch (cell.getCellType()) {
            case NUMERIC -> cell.getNumericCellValue();
            case STRING -> {
                try { yield Double.parseDouble(cell.getStringCellValue().trim()); }
                catch (NumberFormatException e) { yield 0; }
            }
            default -> 0;
        };
    }

    // DTO
    @lombok.Data
    public static class ImportResult {
        private int total = 0;
        private int success = 0;
        private List<ImportError> errors = new ArrayList<>();

        public void addError(int row, String message) {
            errors.add(new ImportError(row, message));
        }
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class ImportError {
        private int row;
        private String message;
    }
}
