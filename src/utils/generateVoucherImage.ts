import { PayrollCalculation, WeekPeriod } from '../types/payroll';
import { formatUSD, formatVES } from './bcv';

export function generateVoucherDataUrl(
  calc: PayrollCalculation,
  bcvRate: number,
  weeks: WeekPeriod[]
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const moraWeeks = weeks.filter((w) => w.status === 'mora');
  const normalWeeks = weeks.filter((w) => w.status === 'normal');

  // Retina scale
  const scale = 2;
  const width = 640;
  // Calculate dynamic height based on lines
  const baseHeight = 620;
  const moraLinesHeight = moraWeeks.length * 24;
  const normalLinesHeight = normalWeeks.length * 24;
  const height = baseHeight + moraLinesHeight + normalLinesHeight;

  canvas.width = width * scale;
  canvas.height = height * scale;

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Header Dark Banner
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, 100);

  // Header Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('RESUMEN DE COBRO DE NÓMINA', 30, 42);

  // Subheader
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`Inicio del proyecto: 20/07/2026  ·  Tasa BCV: ${formatVES(bcvRate)} / USD`, 30, 70);

  let y = 130;

  // KPI Row: Salario Mensual & Semanal
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(30, y, 280, 68, 8);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(330, y, 280, 68, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('SALARIO MENSUAL', 46, y + 26);
  ctx.fillText('SALARIO SEMANAL', 346, y + 26);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillText(formatUSD(calc.monthlySalary), 46, y + 50);
  ctx.fillText(formatUSD(calc.weeklySalaryUSD), 346, y + 50);

  y += 95;

  // Section: Semanas con Mora
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`SEMANAS CON MORA (+${calc.moraPercentage}%):  ${calc.moraWeeksCount} semanas`, 30, y);

  y += 18;

  if (moraWeeks.length > 0) {
    ctx.fillStyle = '#334155';
    ctx.font = '12px "JetBrains Mono", monospace';
    moraWeeks.forEach((w) => {
      ctx.fillText(`• Sem ${w.number} (${w.formattedRange})`, 42, y);
      y += 24;
    });

    ctx.fillStyle = '#475569';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Monto Base: ${formatUSD(calc.moraBaseUSD)}  +  Recargo Mora: ${formatUSD(calc.moraInterestUSD)}`, 42, y);
    y += 22;

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Subtotal con Mora: ${formatUSD(calc.moraTotalUSD)}  (${formatVES(calc.moraTotalUSD * bcvRate)})`, 42, y);
    y += 32;
  } else {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('• Ninguna semana con mora', 42, y);
    y += 28;
  }

  // Divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(30, y);
  ctx.lineTo(width - 30, y);
  ctx.stroke();
  y += 24;

  // Section: Semanas Normales
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`SEMANA NORMAL (SIN MORA):  ${calc.normalWeeksCount} semana`, 30, y);
  y += 18;

  if (normalWeeks.length > 0) {
    ctx.fillStyle = '#334155';
    ctx.font = '12px "JetBrains Mono", monospace';
    normalWeeks.forEach((w) => {
      ctx.fillText(`• Sem ${w.number} (${w.formattedRange})`, 42, y);
      y += 24;
    });

    ctx.fillStyle = '#1d4ed8';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Subtotal Normal: ${formatUSD(calc.normalTotalUSD)}  (${formatVES(calc.normalTotalUSD * bcvRate)})`, 42, y);
    y += 32;
  } else {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('• Ninguna semana normal', 42, y);
    y += 28;
  }

  // Fondo (if included)
  if (calc.includeFondo) {
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(width - 30, y);
    ctx.stroke();
    y += 24;

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('SEMANA 1 DE FONDO (EN LIQUIDACIÓN):', 30, y);
    y += 20;

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Subtotal Fondo: ${formatUSD(calc.fondoTotalUSD)}  (${formatVES(calc.fondoTotalUSD * bcvRate)})`, 42, y);
    y += 32;
  }

  // Grand Total Dark Banner
  y += 10;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(30, y, width - 60, 95, 12);
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('TOTAL NETO A RECIBIR:', 50, y + 32);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.fillText(formatUSD(calc.totalToReceiveUSD), 50, y + 68);

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  const vesText = formatVES(calc.totalToReceiveVES);
  const vesWidth = ctx.measureText(vesText).width;
  ctx.fillText(vesText, width - 50 - vesWidth, y + 68);

  // Footer date
  y += 120;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const todayStr = new Date().toLocaleDateString('es-VE');
  ctx.fillText(`Comprobante generado el ${todayStr}  ·  Control de Nómina y Mora BCV`, 30, y);

  return canvas.toDataURL('image/png');
}
