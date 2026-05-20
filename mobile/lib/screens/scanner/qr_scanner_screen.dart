import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../core/theme.dart';
import '../equipment/equipment_screen.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final _controller = MobileScannerController(detectionSpeed: DetectionSpeed.normal, facing: CameraFacing.back);
  bool _scanned = false;
  bool _torchOn = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (_scanned) return;
    final barcode = capture.barcodes.firstOrNull;
    if (barcode?.rawValue == null) return;

    setState(() => _scanned = true);

    final value = barcode!.rawValue!;

    // QR-kod JSON formatini parse qilish
    try {
      final data = jsonDecode(value);
      final type = data['type'] as String?;
      final id = data['id'] as int?;

      if (type == 'equipment' && id != null) {
        Navigator.push(context, MaterialPageRoute(builder: (_) => EquipmentDetailScreen(id: id)));
        Future.delayed(const Duration(seconds: 1), () {
          if (mounted) setState(() => _scanned = false);
        });
        return;
      }
    } catch (_) {
      // JSON emas — oddiy inventar raqami sifatida ko'rsatish
    }

    // Fallback: oddiy QR kod qiymati
    if (mounted) {
      showModalBottomSheet(
        context: context,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
        builder: (ctx) => _ScanResultSheet(value: value, onClose: () {
          Navigator.pop(ctx);
          setState(() => _scanned = false);
        }),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Kamera
          MobileScanner(controller: _controller, onDetect: _onDetect),

          // Overlay
          Container(
            decoration: ShapeDecoration(
              shape: _ScannerOverlay(borderColor: _scanned ? AppTheme.success : AppTheme.primary, borderWidth: 3),
            ),
          ),

          // Top bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 8, bottom: 20, left: 20, right: 20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.black.withValues(alpha: 0.7), Colors.transparent],
                ),
              ),
              child: const Column(
                children: [
                  Text('📷 QR-kod skanerlash', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                  SizedBox(height: 4),
                  Text('Uskuna QR-kodini kameraga yo\'naltiring', style: TextStyle(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
          ),

          // Quyidagi tugmalar
          Positioned(
            bottom: 80,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Flashlight
                GestureDetector(
                  onTap: () {
                    _controller.toggleTorch();
                    setState(() => _torchOn = !_torchOn);
                  },
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: _torchOn ? Colors.amber.withValues(alpha: 0.3) : Colors.white.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: _torchOn ? Colors.amber : Colors.white.withValues(alpha: 0.3)),
                    ),
                    child: Icon(_torchOn ? Icons.flashlight_on_rounded : Icons.flashlight_off_rounded, color: _torchOn ? Colors.amber : Colors.white, size: 26),
                  ),
                ),
                const SizedBox(width: 24),
                // Kamerani almashtirish
                GestureDetector(
                  onTap: () => _controller.switchCamera(),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                    ),
                    child: const Icon(Icons.cameraswitch_rounded, color: Colors.white, size: 26),
                  ),
                ),
              ],
            ),
          ),

          // Skanerlangan animatsiya
          if (_scanned)
            Positioned.fill(
              child: Center(
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppTheme.success.withValues(alpha: 0.9),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(Icons.check_circle_rounded, color: Colors.white, size: 48),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ScanResultSheet extends StatelessWidget {
  final String value;
  final VoidCallback onClose;
  const _ScanResultSheet({required this.value, required this.onClose});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 40, height: 4, decoration: BoxDecoration(color: AppTheme.textMuted.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppTheme.success.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: const Icon(Icons.qr_code_2_rounded, color: AppTheme.success, size: 40),
          ),
          const SizedBox(height: 16),
          const Text('QR-kod aniqlandi', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: AppTheme.bgMain, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppTheme.border)),
            child: Text(value, style: const TextStyle(fontSize: 14, fontFamily: 'monospace'), textAlign: TextAlign.center),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: onClose,
                  child: const Text('Qayta skanerlash'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: FilledButton.icon(
                  onPressed: onClose,
                  icon: const Icon(Icons.copy_rounded, size: 18),
                  label: const Text('Nusxalash'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ScannerOverlay extends ShapeBorder {
  final Color borderColor;
  final double borderWidth;

  const _ScannerOverlay({this.borderColor = Colors.blue, this.borderWidth = 3});

  @override
  EdgeInsetsGeometry get dimensions => EdgeInsets.zero;

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) => getOuterPath(rect, textDirection: textDirection);

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    final scanRect = Rect.fromCenter(center: rect.center, width: 260, height: 260);
    return Path()
      ..addRect(rect)
      ..addRRect(RRect.fromRectAndRadius(scanRect, const Radius.circular(20)))
      ..fillType = PathFillType.evenOdd;
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    final scanRect = Rect.fromCenter(center: rect.center, width: 260, height: 260);
    final rrect = RRect.fromRectAndRadius(scanRect, const Radius.circular(20));

    // Qorong'i overlay
    canvas.drawPath(
      Path()..addRect(rect)..addRRect(rrect)..fillType = PathFillType.evenOdd,
      Paint()..color = Colors.black.withValues(alpha: 0.5),
    );

    // Burchak chiziqlari (premium corner lines)
    final cornerLength = 30.0;
    final paint = Paint()
      ..color = borderColor
      ..strokeWidth = borderWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final l = scanRect.left, t = scanRect.top, r = scanRect.right, b = scanRect.bottom;
    final rad = 20.0;

    // Yuqori chap
    canvas.drawPath(Path()..moveTo(l, t + cornerLength)..lineTo(l, t + rad)..arcToPoint(Offset(l + rad, t), radius: Radius.circular(rad)), paint);
    canvas.drawPath(Path()..moveTo(l + rad, t)..lineTo(l + cornerLength, t), paint);
    // Yuqori o'ng
    canvas.drawPath(Path()..moveTo(r - cornerLength, t)..lineTo(r - rad, t)..arcToPoint(Offset(r, t + rad), radius: Radius.circular(rad)), paint);
    canvas.drawPath(Path()..moveTo(r, t + rad)..lineTo(r, t + cornerLength), paint);
    // Pastki chap
    canvas.drawPath(Path()..moveTo(l, b - cornerLength)..lineTo(l, b - rad)..arcToPoint(Offset(l + rad, b), radius: Radius.circular(rad)), paint);
    canvas.drawPath(Path()..moveTo(l + rad, b)..lineTo(l + cornerLength, b), paint);
    // Pastki o'ng
    canvas.drawPath(Path()..moveTo(r - cornerLength, b)..lineTo(r - rad, b)..arcToPoint(Offset(r, b - rad), radius: Radius.circular(rad)), paint);
    canvas.drawPath(Path()..moveTo(r, b - rad)..lineTo(r, b - cornerLength), paint);
  }

  @override
  ShapeBorder scale(double t) => this;
}
