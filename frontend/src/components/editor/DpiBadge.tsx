import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface DpiBadgeProps {
    status: 'ok' | 'warning' | 'blocked';
    effectiveDpi: number;
    maxPrintSize?: string;
}

const CONFIG = {
    ok: {
        Icon: CheckCircle,
        bg: 'bg-green-50',
        border: 'border-green-400',
        text: 'text-green-700',
        label: 'Qualité excellente',
    },
    warning: {
        Icon: AlertTriangle,
        bg: 'bg-orange-50',
        border: 'border-orange-400',
        text: 'text-orange-700',
        label: 'Qualité suffisante',
    },
    blocked: {
        Icon: XCircle,
        bg: 'bg-red-50',
        border: 'border-red-400',
        text: 'text-red-700',
        label: 'Résolution trop faible',
    },
};

export const DpiBadge: React.FC<DpiBadgeProps> = ({ status, effectiveDpi, maxPrintSize }) => {
    const { Icon, bg, border, text, label } = CONFIG[status];

    return (
        <div
            className={`flex items-start gap-1.5 px-2 py-1.5 rounded border ${bg} ${border} ${text} text-xs`}
        >
            <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
                <p className="font-semibold leading-tight">{label}</p>
                <p className="leading-tight">{effectiveDpi} DPI</p>
                {(status === 'warning' || status === 'blocked') && maxPrintSize && (
                    <p className="leading-tight opacity-80">Max : {maxPrintSize}</p>
                )}
            </div>
        </div>
    );
};

export default DpiBadge;
