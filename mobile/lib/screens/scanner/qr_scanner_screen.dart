import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../core/theme.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final _controller = MobileScannerController(detectionSpeed: DetectionSpeed.normal, facing: CameraFacing.back);
  bool _scanned = false;

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
    // QR koddan equipment ID ni olish
    // Format: {"type":"equipment","id":123}
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('QR kod: $value'),
        backgroundColor: AppTheme.success,
        action: SnackBarAction(
          label: 'Qayta skanerlash',
          textColor: Colors.white,
          onPressed: () => setState(() => _scanned = false),
        ),
      ),
    );

    // TODO: parse JSON va navigate to equipment detail
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _scanned = false);
    });
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
              padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 8, bottom: 16, left: 20, right: 20),
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

          // Flashlight button
          Positioned(
            bottom: 100,
            left: 0,
            right: 0,
            child: Center(
              child: GestureDetector(
                onTap: () => _controller.toggleTorch(),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                  ),
                  child: const Icon(Icons.flashlight_on_rounded, color: Colors.white, size: 28),
                ),
              ),
            ),
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

    // Burchak chiziqlari
    final paint = Paint()..color = borderColor..strokeWidth = borderWidth..style = PaintingStyle.stroke;
    canvas.drawRRect(rrect, paint);
  }

  @override
  ShapeBorder scale(double t) => this;
}
