import type { QualityReport } from './interfaces/quality-report.interface';

/**
 * Pure function — no dependencies, fully testable.
 * Exported so ImagesService can call it and tests can import it directly.
 */
export function computeDpiReport(
    widthPx: number,
    heightPx: number,
    printWidthCm: number,
    printHeightCm: number,
    dpiTarget: number = 300,
): QualityReport {
    const requiredW = Math.round((printWidthCm / 2.54) * dpiTarget);
    const requiredH = Math.round((printHeightCm / 2.54) * dpiTarget);

    const effectiveDpiW = Math.round((widthPx / printWidthCm) * 2.54);
    const effectiveDpiH = Math.round((heightPx / printHeightCm) * 2.54);
    const effectiveDpi = Math.min(effectiveDpiW, effectiveDpiH);

    const maxPrintW = Math.floor((widthPx / dpiTarget) * 2.54);
    const maxPrintH = Math.floor((heightPx / dpiTarget) * 2.54);

    let status: 'ok' | 'warning' | 'blocked';
    if (effectiveDpi >= 300) status = 'ok';
    else if (effectiveDpi >= 180) status = 'warning';
    else status = 'blocked';

    const dpiOk = status !== 'blocked';
    const warnings: string[] = [];
    const errors: string[] = [];

    if (status === 'warning') {
        warnings.push(
            `Résolution suffisante mais non optimale. Taille max recommandée : ${maxPrintW}x${maxPrintH}cm`,
        );
    }
    if (status === 'blocked') {
        errors.push(
            `Résolution trop faible : ${effectiveDpi} DPI. Minimum requis : 180 DPI. Taille max possible : ${maxPrintW}x${maxPrintH}cm`,
        );
    }

    return {
        dpiOk,
        effectiveDpi,
        status,
        requiredPx: { w: requiredW, h: requiredH },
        maxPrintSize: `${maxPrintW}x${maxPrintH}cm`,
        qualityScore: parseFloat(Math.min(effectiveDpi / dpiTarget, 1.0).toFixed(2)),
        warnings,
        errors,
    };
}
