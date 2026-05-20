package uz.boshliq.equipment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.boshliq.equipment.service.ReportService;

import java.time.LocalDate;
import java.util.List;

/**
 * TZ 5.1-5.2: Hisobotlar va Dashboard API.
 */
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService service;

    // ====== Dashboard KPI (TZ 5.2) ======

    @GetMapping("/dashboard")
    public ResponseEntity<ReportService.DashboardKpi> getDashboardKpi() {
        return ResponseEntity.ok(service.getDashboardKpi());
    }

    // ====== 1. Uskunalar holati (TZ 5.1.1) ======

    @GetMapping("/equipment-status")
    public ResponseEntity<ReportService.EquipmentStatusReport> getEquipmentStatus() {
        return ResponseEntity.ok(service.getEquipmentStatusReport());
    }

    // ====== 2. PPR bajarilishi (TZ 5.1.2) ======

    @GetMapping("/ppr-performance")
    public ResponseEntity<ReportService.PprPerformanceReport> getPprPerformance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        return ResponseEntity.ok(service.getPprPerformanceReport(dateFrom, dateTo));
    }

    // ====== 3. Muddati o'tgan vazifalar (TZ 5.1.3) ======

    @GetMapping("/overdue-tasks")
    public ResponseEntity<List<ReportService.OverdueTaskDto>> getOverdueTasks() {
        return ResponseEntity.ok(service.getOverdueTasksReport());
    }

    // ====== 4. Ehtiyot qismlar sarfi (TZ 5.1.4) ======

    @GetMapping("/spare-part-usage")
    public ResponseEntity<ReportService.SparePartUsageReport> getSparePartUsage(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        return ResponseEntity.ok(service.getSparePartUsageReport(dateFrom, dateTo));
    }

    // ====== 5. Ombor qoldiqlari (TZ 5.1.5) ======

    @GetMapping("/warehouse-stock")
    public ResponseEntity<ReportService.WarehouseStockReport> getWarehouseStock() {
        return ResponseEntity.ok(service.getWarehouseStockReport());
    }
}
