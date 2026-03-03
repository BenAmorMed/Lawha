import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrintWorkerService } from './print-worker.service';

@Processor('print')
export class PrintWorkerProcessor {
  private logger = new Logger('PrintWorkerProcessor');

  constructor(private printWorkerService: PrintWorkerService) {}

  /**
   * Process print job: Generate PDF from canvas data
   */
  @Process('generate-pdf')
  async handleGeneratePDF(
    job: Job<{
      orderId: string;
      canvasContent: string;
      width: number;
      height: number;
    }>,
  ) {
    this.logger.log(`Processing print job for order: ${job.data.orderId}`);

    try {
      const { orderId, canvasContent, width, height } = job.data;

      const pdfUrl = await this.printWorkerService.generatePrintPDF(
        orderId,
        canvasContent,
        width,
        height,
      );

      this.logger.log(`Print job completed for order ${orderId}: ${pdfUrl}`);

      return {
        success: true,
        orderId,
        pdfUrl,
      };
    } catch (error) {
      this.logger.error(`Print job failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process proof generation job
   */
  @Process('generate-proof')
  async handleGenerateProof(
    job: Job<{
      orderId: string;
      canvasPreviewUrl: string;
    }>,
  ) {
    this.logger.log(`Processing proof job for order: ${job.data.orderId}`);

    try {
      const { orderId, canvasPreviewUrl } = job.data;

      const proofUrl = await this.printWorkerService.generateProofPDF(
        orderId,
        canvasPreviewUrl,
      );

      return {
        success: true,
        orderId,
        proofUrl,
      };
    } catch (error) {
      this.logger.error(`Proof job failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process invoice generation job
   */
  @Process('generate-invoice')
  async handleGenerateInvoice(
    job: Job<{
      orderId: string;
    }>,
  ) {
    this.logger.log(`Processing invoice job for order: ${job.data.orderId}`);

    try {
      const invoiceUrl = await this.printWorkerService.generateInvoicePDF(
        job.data.orderId,
      );

      return {
        success: true,
        orderId: job.data.orderId,
        invoiceUrl,
      };
    } catch (error) {
      this.logger.error(`Invoice job failed: ${error.message}`);
      throw error;
    }
  }
}
