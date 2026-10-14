import React, { useState } from 'react';
import { PayrollCalculation } from '../types/payroll';
import { formatUSD, formatVES } from '../utils/bcv';
import { Copy, Check, Download, FileText } from 'lucide-react';

interface CalculationSummaryProps {
  calc: PayrollCalculation;
  bcvRate: number;
  onOpenSummaryModal: () => void;
  onDownloadPng: () => void;
}

export const CalculationSummary: React.FC<CalculationSummaryProps> = ({
  calc,
  bcvRate,
  onOpenSummaryModal,
  onDownloadPng,
}) => {
  const [copied, setCopied] = useState(false);

  const quickText = `*COBRO DE NÓMINA:*
• Salario semanal: ${formatUSD(calc.weeklySalaryUSD)}
• ${calc.moraWeeksCount} sem con mora 20%: ${formatUSD(calc.moraTotalUSD)}
• ${calc.normalWeeksCount} sem normal: ${formatUSD(calc.normalTotalUSD)}
${calc.includeFondo ? `• 1 sem fondo: ${formatUSD(calc.fondoTotalUSD)}\n` : ''}
*TOTAL:* ${formatUSD(calc.totalToReceiveUSD)}
*EN BS (BCV ${formatVES(bcvRate)}):* ${formatVES(calc.totalToReceiveVES)}`;

  const handleQuickCopy = async () => {
    try {
      await navigator.clipboard.writeText(quickText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
      {/* Total Box */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Total Neto a Recibir
        </span>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tabular-nums tracking-tight">
            {formatUSD(calc.totalToReceiveUSD)}
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatVES(calc.totalToReceiveVES)}
          </div>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          A la tasa oficial BCV: <span className="font-mono text-slate-200">{formatVES(bcvRate)}</span>
        </div>
      </div>

      {/* Clear Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-800 text-xs font-mono">
        {/* Mora Breakdown */}
        <div className="bg-slate-800/80 p-3 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-slate-300 font-sans font-semibold">
              {calc.moraWeeksCount} Semanas con Mora (20%)
            </div>
            <div className="text-[11px] text-slate-400 font-sans">
              Base {formatUSD(calc.moraBaseUSD)} + Mora {formatUSD(calc.moraInterestUSD)}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-white text-sm tabular-nums">
              {formatUSD(calc.moraTotalUSD)}
            </div>
            <div className="text-[11px] text-emerald-400 tabular-nums">
              {formatVES(calc.moraTotalUSD * bcvRate)}
            </div>
          </div>
        </div>

        {/* Normal Breakdown */}
        <div className="bg-slate-800/80 p-3 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-slate-300 font-sans font-semibold">
              {calc.normalWeeksCount} Semana Normal
            </div>
            <div className="text-[11px] text-slate-400 font-sans">
              Vencida semana anterior
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-white text-sm tabular-nums">
              {formatUSD(calc.normalTotalUSD)}
            </div>
            <div className="text-[11px] text-emerald-400 tabular-nums">
              {formatVES(calc.normalTotalUSD * bcvRate)}
            </div>
          </div>
        </div>

        {/* Fondo (if included) */}
        {calc.includeFondo && (
          <div className="bg-slate-800/80 p-3 rounded-lg flex items-center justify-between sm:col-span-2">
            <div>
              <div className="text-slate-300 font-sans font-semibold">
                Semana 1 de Fondo (Liquidación)
              </div>
              <div className="text-[11px] text-slate-400 font-sans">
                Retenida desde el 20/07/2026
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-white text-sm tabular-nums">
                {formatUSD(calc.fondoTotalUSD)}
              </div>
              <div className="text-[11px] text-emerald-400 tabular-nums">
                {formatVES(calc.fondoTotalUSD * bcvRate)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        {/* Generar Imagen PNG */}
        <button
          type="button"
          onClick={onDownloadPng}
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors min-h-[44px]"
        >
          <Download className="w-4 h-4" />
          <span>Descargar PNG</span>
        </button>

        {/* Copiar Texto Rápido */}
        <button
          type="button"
          onClick={handleQuickCopy}
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors min-h-[44px]"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
        </button>

        {/* Ver Detalle / Enviar */}
        <button
          type="button"
          onClick={onOpenSummaryModal}
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 rounded-lg transition-colors min-h-[44px]"
        >
          <FileText className="w-4 h-4" />
          <span>Ver Detalle</span>
        </button>
      </div>
    </div>
  );
};
