export interface QualityReport {
    dpiOk: boolean;
    effectiveDpi: number;
    status: 'ok' | 'warning' | 'blocked';
    requiredPx: { w: number; h: number };
    maxPrintSize: string;
    qualityScore: number;
    warnings: string[];
    errors: string[];
}
