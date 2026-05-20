package uz.boshliq.equipment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.boshliq.equipment.entity.*;
import uz.boshliq.equipment.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * TZ 5.1: 5 turdagi hisobot.
 * TZ 5.2: Dashboard KPI va statistika.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final EquipmentRepository equipmentRepository;
    private final PprTaskRepository pprTaskRepository;
    private final WarehouseStockRepository stockRepository;
    private final StockOperationRepository operationRepository;
    private final StatusRepository statusRepository;
    private final CategoryRepository categoryRepository;

    // ======================== 1. USKUNALAR HOLATI (TZ 5.1.1) ========================

    public EquipmentStatusReport getEquipmentStatusReport() {
        EquipmentStatusReport report = new EquipmentStatusReport();
        report.setTotalEquipment(equipmentRepository.countByIsDeletedFalse());

        List<StatusRepository.StatusCount> statusCounts = statusRepository.findStatusCounts();
        report.setByStatus(statusCounts.stream().map(sc -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("statusName", sc.getStatusName());
            item.put("count", sc.getCount());
            return item;
        }).collect(Collectors.toList()));

        // Toifa bo'yicha
        report.setByCategory(categoryRepository.findAllByIsDeletedFalseOrderByNameUzAsc().stream().map(cat -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("categoryName", cat.getNameUz());
            item.put("count", equipmentRepository.countByCategoryIdAndIsDeletedFalse(cat.getId()));
            return item;
        }).collect(Collectors.toList()));

        return report;
    }

    // ======================== 2. PPR BAJARILISHI (TZ 5.1.2) ========================

    public PprPerformanceReport getPprPerformanceReport(LocalDate dateFrom, LocalDate dateTo) {
        PprPerformanceReport report = new PprPerformanceReport();
        report.setDateFrom(dateFrom);
        report.setDateTo(dateTo);

        List<PprTask> tasks = pprTaskRepository
                .findAllByScheduledDateBetweenAndIsDeletedFalse(dateFrom, dateTo);

        long total = tasks.size();
        long completed = tasks.stream().filter(t ->
                t.getStatus() == PprTask.TaskStatus.COMPLETED || t.getStatus() == PprTask.TaskStatus.APPROVED
        ).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus() == PprTask.TaskStatus.IN_PROGRESS).count();
        long scheduled = tasks.stream().filter(t -> t.getStatus() == PprTask.TaskStatus.SCHEDULED).count();

        report.setTotalTasks(total);
        report.setCompletedTasks(completed);
        report.setInProgressTasks(inProgress);
        report.setScheduledTasks(scheduled);
        report.setCompletionRate(total > 0 ? Math.round((double) completed / total * 100.0) : 0);

        return report;
    }

    // ======================== 3. MUDDATI O'TGAN VAZIFALAR (TZ 5.1.3) ========================

    public List<OverdueTaskDto> getOverdueTasksReport() {
        return pprTaskRepository
                .findAllByScheduledDateBeforeAndStatusAndIsDeletedFalse(LocalDate.now(), PprTask.TaskStatus.SCHEDULED)
                .stream().map(t -> {
                    OverdueTaskDto dto = new OverdueTaskDto();
                    dto.setTaskNumber(t.getTaskNumber());
                    dto.setEquipmentName(t.getEquipment() != null ? t.getEquipment().getName() : null);
                    dto.setScheduledDate(t.getScheduledDate());
                    dto.setOverdueDays((int) ChronoUnit.DAYS.between(t.getScheduledDate(), LocalDate.now()));
                    dto.setAssignedTo(t.getAssignedTo() != null ? t.getAssignedTo().getFullName() : null);
                    dto.setPriority(t.getPriority().name());
                    return dto;
                }).collect(Collectors.toList());
    }

    // ======================== 4. EHTIYOT QISMLAR SARFI (TZ 5.1.4) ========================

    public SparePartUsageReport getSparePartUsageReport(LocalDate dateFrom, LocalDate dateTo) {
        SparePartUsageReport report = new SparePartUsageReport();
        report.setDateFrom(dateFrom);
        report.setDateTo(dateTo);

        LocalDateTime from = dateFrom.atStartOfDay();
        LocalDateTime to = dateTo.atTime(LocalTime.MAX);

        List<StockOperation> operations = operationRepository.findAllByCreatedAtBetween(from, to);
        List<StockOperation> outgoing = operations.stream()
                .filter(op -> op.getOperationType() == StockOperation.OperationType.OUTGOING)
                .toList();

        report.setTotalOperations((long) outgoing.size());
        report.setTotalQuantity(outgoing.stream().mapToInt(StockOperation::getQuantity).sum());
        report.setTotalSum(outgoing.stream()
                .filter(op -> op.getTotalPrice() != null)
                .map(StockOperation::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        // Ehtiyot qism bo'yicha guruhlash
        Map<String, Integer> byPart = new LinkedHashMap<>();
        outgoing.forEach(op -> {
            String name = op.getSparePart() != null ? op.getSparePart().getName() : "Noma'lum";
            byPart.merge(name, op.getQuantity(), Integer::sum);
        });
        report.setByPart(byPart);

        return report;
    }

    // ======================== 5. OMBOR QOLDIQLARI (TZ 5.1.5) ========================

    public WarehouseStockReport getWarehouseStockReport() {
        WarehouseStockReport report = new WarehouseStockReport();

        List<WarehouseStock> all = stockRepository.findAll();
        report.setTotalItems((long) all.size());

        List<WarehouseStock> lowStock = stockRepository.findLowStockItems();
        report.setLowStockCount((long) lowStock.size());

        report.setLowStockItems(lowStock.stream().map(s -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("sparePartName", s.getSparePart().getName());
            item.put("sparePartCode", s.getSparePart().getCode());
            item.put("warehouseName", s.getWarehouse().getName());
            item.put("quantity", s.getQuantity());
            item.put("minStock", s.getSparePart().getMinStock());
            return item;
        }).collect(Collectors.toList()));

        return report;
    }

    // ======================== DASHBOARD KPI (TZ 5.2) ========================

    public DashboardKpi getDashboardKpi() {
        DashboardKpi kpi = new DashboardKpi();

        // KPI 1: Jami uskunalar
        kpi.setTotalEquipment(equipmentRepository.countByIsDeletedFalse());

        // KPI 2: PPR bajarilish foizi (joriy oy)
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
        PprPerformanceReport ppr = getPprPerformanceReport(monthStart, monthEnd);
        kpi.setPprCompletionRate(ppr.getCompletionRate());
        kpi.setPprTotalTasks(ppr.getTotalTasks());
        kpi.setPprCompletedTasks(ppr.getCompletedTasks());

        // KPI 3: Muddati o'tgan vazifalar
        List<PprTask> overdue = pprTaskRepository
                .findAllByScheduledDateBeforeAndStatusAndIsDeletedFalse(LocalDate.now(), PprTask.TaskStatus.SCHEDULED);
        kpi.setOverdueTasks((long) overdue.size());

        // KPI 4: Ombordagi kritik qoldiqlar
        kpi.setLowStockAlerts((long) stockRepository.findLowStockItems().size());

        // KPI 5: Bugungi vazifalar
        List<PprTask> todayTasks = pprTaskRepository
                .findAllByScheduledDateBetweenAndIsDeletedFalse(LocalDate.now(), LocalDate.now());
        kpi.setTodayTasks((long) todayTasks.size());

        return kpi;
    }

    // ======================== DTO lar ========================

    @lombok.Data
    public static class EquipmentStatusReport {
        private long totalEquipment;
        private List<Map<String, Object>> byStatus;
        private List<Map<String, Object>> byCategory;
    }

    @lombok.Data
    public static class PprPerformanceReport {
        private LocalDate dateFrom;
        private LocalDate dateTo;
        private long totalTasks;
        private long completedTasks;
        private long inProgressTasks;
        private long scheduledTasks;
        private long completionRate;
    }

    @lombok.Data
    public static class OverdueTaskDto {
        private String taskNumber;
        private String equipmentName;
        private LocalDate scheduledDate;
        private int overdueDays;
        private String assignedTo;
        private String priority;
    }

    @lombok.Data
    public static class SparePartUsageReport {
        private LocalDate dateFrom;
        private LocalDate dateTo;
        private long totalOperations;
        private int totalQuantity;
        private BigDecimal totalSum;
        private Map<String, Integer> byPart;
    }

    @lombok.Data
    public static class WarehouseStockReport {
        private long totalItems;
        private long lowStockCount;
        private List<Map<String, Object>> lowStockItems;
    }

    @lombok.Data
    public static class DashboardKpi {
        private long totalEquipment;
        private long pprCompletionRate;
        private long pprTotalTasks;
        private long pprCompletedTasks;
        private long overdueTasks;
        private long lowStockAlerts;
        private long todayTasks;
    }
}
