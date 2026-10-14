import React, { useState } from 'react';
import { X, Copy, Check, Printer, Send, Calendar, DollarSign, Building2, AlertCircle, FileText, Download, Image as ImageIcon } from 'lucide-react';
import { PayrollCalculation, WeekPeriod } from '../types/payroll';
import { formatUSD, formatVES } from '../utils/bcv';
import { generateVoucherDataUrl } from '../utils/generateVoucherImage';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  calc: PayrollCalculation;
  bcvRate: number;
  weeks: WeekPeriod[];
  onPrint: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  calc,
  bcvRate,
  weeks,
}) => {
  const [copied, setCopied] = useState(false);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  if (!isOpen) return null;

  const moraWeeksList = weeks.filter((w) => w.status === 'mora');
  const normalWeeksList = weeks.filter((w) => w.status === 'normal');

  // Clean text format
  const summaryText = `RESUMEN DE COBRO DE NÓMINA Y MORA BCV
Inicio del proyecto: 20/07/2026
Salario Mensual: ${formatUSD(calc.monthlySalary)} (${formatVES(calc.monthlySalary * bcvRate)})
Salario Semanal: ${formatUSD(calc.weeklySalaryUSD)} (${formatVES(calc.weeklySalaryUSD * bcvRate)})
Tasa Oficial BCV: ${formatVES(bcvRate)} / USD

DESGLOSE DE SEMANAS PENDIENTES:
[+] ${calc.moraWeeksCount} Semanas con Mora (+${calc.moraPercentage}%):
${moraWeeksList.map((w) => `  - Sem ${w.number} (${w.formattedRange})`).join('\n')}
  Monto Base: ${formatUSD(calc.moraBaseUSD)}
  Recargo Mora (+${calc.moraPercentage}%): ${formatUSD(calc.moraInterestUSD)}
  Subtotal con Mora: ${formatUSD(calc.moraTotalUSD)} (${formatVES(calc.moraTotalUSD * bcvRate)})

[+] ${calc.normalWeeksCount} Semana Normal (Sin Mora):
${normalWeeksList.map((w) => `  - Sem ${w.number} (${w.formattedRange})`).join('\n')}
  Subtotal Normal: ${formatUSD(calc.normalTotalUSD)} (${formatVES(calc.normalTotalUSD * bcvRate)})

${calc.includeFondo ? `[+] Semana 1 de Fondo (Liquidación):
  Subtotal Fondo: ${formatUSD(calc.fondoTotalUSD)} (${formatVES(calc.fondoTotalUSD * bcvRate)})
` : `[i] Semana 1 de Fondo: Retenida en reserva (${formatUSD(calc.weeklySalaryUSD)}).`}
--------------------------------------------------
TOTAL NETO A RECIBIR:
${formatUSD(calc.totalToReceiveUSD)}
${formatVES(calc.totalToReceiveVES)} (Tasa BCV)`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(summaryText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Generate PNG image and trigger download
  const handleGeneratePng = () => {
    const url = generateVoucherDataUrl(calc, bcvRate, weeks);
    setPngUrl(url);
    setShowImagePreview(true);

    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprobante_nomina_${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust print handling (creates printable window with the high-res voucher)
  const handlePrintAction = () => {
    const url = pngUrl || generateVoucherDataUrl(calc, bcvRate, weeks);
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Comprobante de Nómina</title>
              <style>
                body { margin: 0; padding: 20px; display: flex; justify-content: center; background: #fff; font-family: sans-serif; }
                img { max-width: 100%; height: auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                @media print {
                  body { padding: 0; }
                  img { box-shadow: none; width: 100%; }
                }
              </style>
            </head>
            <body>
              <img src="${url}" onload="window.focus(); window.print();" />
            </body>
          </html>
        `);
        printWindow.document.close();
        return;
      }
    } catch (err) {
      console.warn('Error opening print window, falling back', err);
    }
    // Fallback
    window.focus();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Resumen para Enviar
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Quick info boxes */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Inicio del proyecto</div>
                <div className="font-bold text-slate-800">20/07/2026</div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Tasa Oficial BCV</div>
                <div className="font-bold font-mono text-slate-800">{formatVES(bcvRate)}</div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Salario Semanal</div>
                <div className="font-bold font-mono text-slate-800">{formatUSD(calc.weeklySalaryUSD)}</div>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <div className="text-[10px] text-amber-700 font-medium">Semanas con mora (20%)</div>
                <div className="font-bold font-mono text-amber-900">{calc.moraWeeksCount} sem ({formatUSD(calc.moraTotalUSD)})</div>
              </div>
            </div>
          </div>

          {/* Clean monospaced text box without emojis */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 mb-1">
              Texto formateado listo para copiar:
            </div>
            <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg font-mono text-xs whitespace-pre-wrap leading-relaxed select-all">
              {summaryText}
            </div>
          </div>

          {/* PNG Image Preview if generated */}
          {showImagePreview && pngUrl && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Imagen PNG Generada</span>
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">Descarga iniciada ✓</span>
              </div>
              <img
                src={pngUrl}
                alt="Comprobante de nómina"
                className="w-full max-h-72 object-contain border border-slate-300 rounded-md bg-white shadow-2xs"
              />
              <p className="text-[11px] text-slate-500 text-center">
                En el celular puedes mantener presionada la imagen para Guardar o Compartir directamente.
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Generar Imagen PNG */}
            <button
              onClick={handleGeneratePng}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors min-h-[38px] shadow-2xs"
              title="Crear y descargar imagen PNG del comprobante"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generar Imagen PNG</span>
            </button>

            {/* Copiar Texto */}
            <button
              onClick={handleCopy}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors min-h-[38px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 rounded-lg transition-colors min-h-[38px]"
            >
              <Send className="w-3.5 h-3.5 text-emerald-700" />
              <span>WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Imprimir */}
            <button
              onClick={handlePrintAction}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 active:bg-slate-200 min-h-[38px]"
              title="Imprimir comprobante en PDF o papel"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 min-h-[38px]"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
