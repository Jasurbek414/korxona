package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * TZ 5.1: Hisobotlarni Excel formatda eksport qilish.
 */
@Service
@RequiredArgsConstructor
public class ReportExportService {

    private final ReportService reportService;

    /** Uskunalar holati (TZ 5.1.1) */
    public byte[] exportEquipmentStatus() {
        ReportService.EquipmentStatusReport data = reportService.getEquipmentStatusReport();
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Uskunalar holati");
            CellStyle hs = headerStyle(wb);

            row(sheet, 0).createCell(0).setCellValue("Uskunalar holati hisoboti");
            row(sheet, 1).createCell(0).setCellValue("Jami: " + data.getTotalEquipment());

            Row header = row(sheet, 3);
            setHeader(header, hs, "Status", "Soni", "Foiz (%)");

            int r = 4;
            long total = Math.max(data.getTotalEquipment(), 1);
            for (Map<String, Object> item : data.getByStatus()) {
                Row row = row(sheet, r++);
                row.createCell(0).setCellValue(str(item, "statusName"));
                int count = num(item, "count");
                row.createCell(1).setCellValue(count);
                row.createCell(2).setCellValue(Math.round((double) count / total * 100));
            }
            autoWidth(sheet, 3);
            return bytes(wb);
        } catch (Exception e) { throw new RuntimeException("Export xatosi", e); }
    }

    /** Muddati o'tgan (TZ 5.1.3) */
    public byte[] exportOverdueTasks() {
        List<ReportService.OverdueTaskDto> tasks = reportService.getOverdueTasksReport();
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Muddati o'tgan");
            CellStyle hs = headerStyle(wb);

            row(sheet, 0).createCell(0).setCellValue("Muddati o'tgan vazifalar (" + tasks.size() + " ta)");
            setHeader(row(sheet, 2), hs, "Raqam", "Uskuna", "Sana", "Kechikish", "Mas'ul", "Ustuvorlik");

            int r = 3;
            for (ReportService.OverdueTaskDto t : tasks) {
                Row row = row(sheet, r++);
                row.createCell(0).setCellValue(t.getTaskNumber());
                row.createCell(1).setCellValue(t.getEquipmentName());
                row.createCell(2).setCellValue(t.getScheduledDate() != null ? t.getScheduledDate().toString() : "");
                row.createCell(3).setCellValue(t.getOverdueDays() + " kun");
                row.createCell(4).setCellValue(t.getAssignedTo() != null ? t.getAssignedTo() : "");
                row.createCell(5).setCellValue(t.getPriority());
            }
            autoWidth(sheet, 6);
            return bytes(wb);
        } catch (Exception e) { throw new RuntimeException("Export xatosi", e); }
    }

    /** Ombor qoldiqlari (TZ 5.1.5) */
    public byte[] exportWarehouseStock() {
        ReportService.WarehouseStockReport data = reportService.getWarehouseStockReport();
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Ombor qoldiqlari");
            CellStyle hs = headerStyle(wb);

            row(sheet, 0).createCell(0).setCellValue("Ombor qoldiqlari hisoboti");
            row(sheet, 1).createCell(0).setCellValue("Kam qoldiq: " + data.getLowStockCount());
            setHeader(row(sheet, 3), hs, "Ehtiyot qism", "Kod", "Ombor", "Qoldiq", "Minimal");

            int r = 4;
            for (Map<String, Object> item : data.getLowStockItems()) {
                Row row = row(sheet, r++);
                row.createCell(0).setCellValue(str(item, "sparePartName"));
                row.createCell(1).setCellValue(str(item, "sparePartCode"));
                row.createCell(2).setCellValue(str(item, "warehouseName"));
                row.createCell(3).setCellValue(num(item, "quantity"));
                row.createCell(4).setCellValue(num(item, "minStock"));
            }
            autoWidth(sheet, 5);
            return bytes(wb);
        } catch (Exception e) { throw new RuntimeException("Export xatosi", e); }
    }

    /** PPR bajarilishi (TZ 5.1.2) */
    public byte[] exportPprPerformance(LocalDate from, LocalDate to) {
        ReportService.PprPerformanceReport data = reportService.getPprPerformanceReport(from, to);
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("PPR bajarilishi");

            row(sheet, 0).createCell(0).setCellValue("PPR bajarilishi hisoboti");
            row(sheet, 1).createCell(0).setCellValue("Davr: " + from + " — " + to);

            setHeader(row(sheet, 3), headerStyle(wb), "Ko'rsatkich", "Qiymat");
            String[][] rows = {
                {"Jami vazifalar", String.valueOf(data.getTotalTasks())},
                {"Bajarilgan", String.valueOf(data.getCompletedTasks())},
                {"Jarayonda", String.valueOf(data.getInProgressTasks())},
                {"Rejalashtirilgan", String.valueOf(data.getScheduledTasks())},
                {"Bajarilish foizi", data.getCompletionRate() + "%"},
            };
            int r = 4;
            for (String[] d : rows) {
                Row row = row(sheet, r++);
                row.createCell(0).setCellValue(d[0]);
                row.createCell(1).setCellValue(d[1]);
            }
            autoWidth(sheet, 2);
            return bytes(wb);
        } catch (Exception e) { throw new RuntimeException("Export xatosi", e); }
    }

    // ========= Helpers =========
    private Row row(Sheet s, int i) { return s.createRow(i); }
    private void setHeader(Row r, CellStyle s, String... cols) {
        for (int i = 0; i < cols.length; i++) { Cell c = r.createCell(i); c.setCellValue(cols[i]); c.setCellStyle(s); }
    }
    private CellStyle headerStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle(); Font f = wb.createFont(); f.setBold(true);
        s.setFont(f); s.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND); s.setBorderBottom(BorderStyle.THIN); return s;
    }
    private void autoWidth(Sheet s, int cols) { for (int i = 0; i < cols; i++) s.setColumnWidth(i, 5500); }
    private byte[] bytes(Workbook wb) throws Exception { ByteArrayOutputStream o = new ByteArrayOutputStream(); wb.write(o); return o.toByteArray(); }
    private String str(Map<String, Object> m, String k) { Object v = m.get(k); return v != null ? v.toString() : ""; }
    private int num(Map<String, Object> m, String k) { Object v = m.get(k); return v instanceof Number ? ((Number) v).intValue() : 0; }
}
