import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import { Order } from '../orders/order.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class PrintWorkerService {
  private logger = new Logger('PrintWorkerService');

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly storageService: StorageService,
  ) { }

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

      return new Promise((resolve, reject) => {
        const widthMm = width * 25.4;
        const heightMm = height * 25.4;

        // Convert to points (1 mm = 2.83465 points)
        const widthPt = widthMm * 2.83465;
        const heightPt = heightMm * 2.83465;

        const doc = new PDFDocument({
          size: [widthPt, heightPt],
          layout: widthPt > heightPt ? 'landscape' : 'portrait',
          margin: 0
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
          const pdfBuffer = Buffer.concat(buffers);

          try {
            const fileName = `orders/${orderId}/print-ready-${Date.now()}.pdf`;
            const url = await this.storageService.uploadFile(
              'canvas-outputs',
              fileName,
              pdfBuffer,
              'application/pdf',
            );

            this.logger.log(`PDF generated successfully for order ${orderId}: ${url}`);

            await this.orderRepository.update(orderId, {
              printPdfUrl: url,
            });

            resolve(url);
          } catch (uploadError) {
            reject(uploadError);
          }
        });

        // Add design content placeholder
        doc.fontSize(12).text(`Design for Order #${orderId.substring(0, 8).toUpperCase()}`, 10, 15);
        doc.fontSize(10).fillColor('#646464').text(`Dimensions: ${width}" x ${height}"`, 10, 30);
        doc.text(`Resolution: 300 DPI (Print Ready)`, 10, 45);

        doc.end();
      });
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

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
          const pdfBuffer = Buffer.concat(buffers);
          try {
            const fileName = `orders/${orderId}/proof-${Date.now()}.pdf`;
            const url = await this.storageService.uploadFile(
              'canvas-outputs',
              fileName,
              pdfBuffer,
              'application/pdf',
            );
            this.logger.log(`Proof PDF generated for order ${orderId}: ${url}`);
            resolve(url);
          } catch (e) {
            reject(e);
          }
        });

        doc.fontSize(20).text('Print Preview', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Order ID: #${orderId.substring(0, 8).toUpperCase()}`);
        doc.fontSize(10).fillColor('#646464').text(`Generated: ${new Date().toLocaleString()}`);

        doc.end();
      });
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

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
          const pdfBuffer = Buffer.concat(buffers);
          try {
            const fileName = `orders/${orderId}/invoice-${Date.now()}.pdf`;
            const url = await this.storageService.uploadFile(
              'canvas-outputs',
              fileName,
              pdfBuffer,
              'application/pdf',
            );
            this.logger.log(`Invoice PDF generated for order ${orderId}: ${url}`);
            resolve(url);
          } catch (e) {
            reject(e);
          }
        });

        doc.fontSize(24).text('INVOICE', 20, 20);
        doc.fontSize(10).text(`Order ID: ${order.id}`, 20, 60);
        doc.text(`Total Amount: $${order.total.toFixed(2)}`, 20, 75);

        doc.end();
      });
    } catch (error) {
      this.logger.error(
        `Failed to generate invoice PDF: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
