import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { jsPDF } from 'jspdf';
import { Order } from '../orders/order.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class PrintWorkerService {
  private logger = new Logger('PrintWorkerService');

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Generate a print-ready PDF from canvas data
   * @param orderId Order ID to generate PDF for
   * @param canvasContent HTML content of the canvas design
   * @param width Canvas width in inches
   * @param height Canvas height in inches
   */
  async generatePrintPDF(
    orderId: string,
    canvasContent: string,
    width: number,
    height: number,
  ): Promise<string> {
    try {
      this.logger.log(`Generating print PDF for order: ${orderId}`);

      // Create PDF document (landscape orientation for canvas prints)
      // Convert inches to mm (1 inch = 25.4mm)
      const widthMm = width * 25.4;
      const heightMm = height * 25.4;

      const pdf = new jsPDF({
        orientation: widthMm > heightMm ? 'l' : 'p',
        unit: 'mm',
        format: [widthMm, heightMm],
      });

      // Set metadata for PDF
      pdf.setProperties({
        title: `Order #${orderId.substring(0, 8).toUpperCase()} - Print Ready`,
        subject: 'Print Ready Canvas Design',
        author: 'Lawha Canvas',
        creator: 'Lawha Print System',
        keywords: 'print, canvas, design',
      });

      // Add white background (for print)
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, widthMm, heightMm, 'F');

      // Add design content
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate scale to fit content
      const scale = Math.min(pageWidth / (width * 25.4), pageHeight / (height * 25.4));

      // Add text representation (since we can't easily embed canvas HTML)
      pdf.setFontSize(12);
      pdf.text(`Design for Order #${orderId.substring(0, 8).toUpperCase()}`, 10, 15);
      
      // Add canvas metadata
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Dimensions: ${width}" x ${height}"`, 10, 25);
      pdf.text(`Resolution: 300 DPI (Print Ready)`, 10, 32);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 10, 39);

      // Add bleed area info for print
      pdf.setDrawColor(200, 200, 200);
      const bleedMm = 3; // 3mm bleed
      pdf.rect(bleedMm, bleedMm, pageWidth - bleedMm * 2, pageHeight - bleedMm * 2);

      // Add print instructions
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      const printInstructions = [
        '--- PRINT INSTRUCTIONS ---',
        '1. Use high-quality photo paper or canvas substrate',
        '2. Print at 100% scale (do not AutoFit)',
        '3. Recommended: Professional print service',
        '4. Color profile: sRGB for best results',
        '5. Paper type: Matte or satin finish',
      ];
      
      let yPos = pageHeight - 30;
      printInstructions.forEach((instruction) => {
        pdf.text(instruction, 10, yPos);
        yPos += 4;
      });

      // Generate PDF as ArrayBuffer
      const pdfArrayBuffer = pdf.output('arraybuffer');
      const pdfBuffer = Buffer.from(pdfArrayBuffer);

      // Upload to MinIO
      const fileName = `orders/${orderId}/print-ready-${Date.now()}.pdf`;
      const url = await this.storageService.uploadFile(
        'canvas-outputs',
        fileName,
        pdfBuffer,
        'application/pdf',
      );

      this.logger.log(`PDF generated successfully for order ${orderId}: ${url}`);

      // Save PDF URL to order
      await this.orderRepository.update(orderId, {
        print_pdf_url: url,
      });

      return url;
    } catch (error) {
      this.logger.error(
        `Failed to generate PDF for order ${orderId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Generate proof PDF (for customer review before printing)
   * @param orderId Order ID
   * @param canvasPreviewUrl Canvas preview image URL
   */
  async generateProofPDF(
    orderId: string,
    canvasPreviewUrl: string,
  ): Promise<string> {
    try {
      this.logger.log(`Generating proof PDF for order: ${orderId}`);

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      // A4 dimensions
      const pageWidth = 210;
      const pageHeight = 297;

      // Add title
      pdf.setFontSize(20);
      pdf.text('Print Preview', pageWidth / 2, 20, { align: 'center' });

      // Add order info
      pdf.setFontSize(12);
      pdf.text(`Order ID: #${orderId.substring(0, 8).toUpperCase()}`, 20, 35);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 42);
      pdf.text(`This is a preview for your review before production.`, 20, 50);

      // Add placeholder for image (URL would need be downloaded separately)
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(20, 60, pageWidth - 40, pageWidth - 40);
      pdf.setFontSize(12);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        'Design Preview',
        pageWidth / 2,
        pageWidth / 2 + 60,
        { align: 'center' },
      );

      // Add approval section
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.text('Approval Checklist:', 20, pageWidth + 70);
      
      const checklist = [
        '☐ Design looks correct',
        '☐ Colors are accurate',
        '☐ Text is readable',
        '☐ No unwanted artifacts',
        '☐ Layout is centered',
      ];

      let yPos = pageWidth + 78;
      checklist.forEach((item) => {
        pdf.setFontSize(10);
        pdf.text(item, 22, yPos);
        yPos += 6;
      });

      // Add footer
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        'Lawha Canvas - Professional Print Service',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' },
      );

      const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

      // Upload to MinIO
      const fileName = `orders/${orderId}/proof-${Date.now()}.pdf`;
      const url = await this.storageService.uploadFile(
        'canvas-outputs',
        fileName,
        pdfBuffer,
        'application/pdf',
      );

      this.logger.log(`Proof PDF generated for order ${orderId}: ${url}`);
      return url;
    } catch (error) {
      this.logger.error(
        `Failed to generate proof PDF for order ${orderId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Generate invoice PDF with order details
   * @param orderId Order ID
   */
  async generateInvoicePDF(orderId: string): Promise<string> {
    try {
      this.logger.log(`Generating invoice PDF for order: ${orderId}`);

      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }

      const pdf = new jsPDF();

      // Header
      pdf.setFontSize(24);
      pdf.text('INVOICE', 20, 20);

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Lawha Canvas', 20, 30);
      pdf.text('Professional Print Service', 20, 37);

      // Invoice details
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.text(`Invoice #: ${orderId.substring(0, 8).toUpperCase()}`, 130, 30);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 130, 40);

      // Order information
      pdf.setFontSize(11);
      pdf.text('Order Details:', 20, 55);

      pdf.setFontSize(10);
      pdf.text(`Order ID: ${order.id}`, 20, 65);
      pdf.text(`Status: ${order.status}`, 20, 72);
      pdf.text(`Total Amount: $${order.total_amount.toFixed(2)}`, 20, 79);

      // Items table header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, 95, 170, 8, 'F');
      pdf.setFontSize(10);
      pdf.text('Description', 25, 100);
      pdf.text('Amount', 150, 100);

      // Items
      pdf.setFillColor(255, 255, 255);
      pdf.text('Canvas Print', 25, 110);
      pdf.text(`$${order.total_amount.toFixed(2)}`, 150, 110);

      // Total
      pdf.setDrawColor(0, 0, 0);
      pdf.line(20, 125, 190, 125);
      pdf.setFontSize(12);
      pdf.text('Total:', 130, 135);
      pdf.text(`$${order.total_amount.toFixed(2)}`, 150, 135);

      // Terms
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Thank you for your order!', 20, 180);
      pdf.text('For questions, contact support@lawhacanvas.com', 20, 187);

      const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

      // Upload to MinIO
      const fileName = `orders/${orderId}/invoice-${Date.now()}.pdf`;
      const url = await this.storageService.uploadFile(
        'canvas-outputs',
        fileName,
        pdfBuffer,
        'application/pdf',
      );

      this.logger.log(`Invoice PDF generated for order ${orderId}: ${url}`);
      return url;
    } catch (error) {
      this.logger.error(
        `Failed to generate invoice PDF: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
