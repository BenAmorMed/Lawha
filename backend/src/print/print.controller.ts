import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrintWorkerService } from './print-worker.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@Controller('api/v1/print')
export class PrintController {
  constructor(
    private printWorkerService: PrintWorkerService,
    @InjectQueue('print')
    private printQueue: Queue,
  ) {}

  /**
   * Queue a print PDF generation job
   * POST /api/v1/print/generate-pdf
   */
  @Post('generate-pdf')
  @UseGuards(JwtAuthGuard)
  async generatePDF(
    @Body()
    body: {
      orderId: string;
      canvasContent: string;
      width: number;
      height: number;
    },
    @CurrentUser() user: User,
  ) {
    const job = await this.printQueue.add('generate-pdf', body, {
      attempts: 3, // Retry 3 times on failure
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    });

    return {
      jobId: job.id,
      status: 'queued',
      message: 'PDF generation job queued successfully',
    };
  }

  /**
   * Queue a proof PDF generation job
   * POST /api/v1/print/generate-proof
   */
  @Post('generate-proof')
  @UseGuards(JwtAuthGuard)
  async generateProof(
    @Body()
    body: {
      orderId: string;
      canvasPreviewUrl: string;
    },
    @CurrentUser() user: User,
  ) {
    const job = await this.printQueue.add('generate-proof', body, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    });

    return {
      jobId: job.id,
      status: 'queued',
      message: 'Proof generation job queued successfully',
    };
  }

  /**
   * Generate an invoice PDF
   * POST /api/v1/print/generate-invoice
   */
  @Post('generate-invoice')
  @UseGuards(JwtAuthGuard)
  async generateInvoice(
    @Body('orderId') orderId: string,
    @CurrentUser() user: User,
  ) {
    const job = await this.printQueue.add('generate-invoice', { orderId }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    });

    return {
      jobId: job.id,
      status: 'queued',
      message: 'Invoice generation job queued successfully',
    };
  }

  /**
   * Get job status
   * GET /api/v1/print/job/:jobId
   */
  @Get('job/:jobId')
  @UseGuards(JwtAuthGuard)
  async getJobStatus(@Param('jobId') jobId: string) {
    const job = await this.printQueue.getJob(jobId);

    if (!job) {
      return {
        status: 'not-found',
        message: 'Job not found',
      };
    }

    const state = await job.getState();
    const progress = job.progress();

    return {
      jobId: job.id,
      status: state,
      progress,
      data: job.data,
      result: job.returnvalue,
    };
  }
}
