import { WeekPeriod, WeekStatus } from '../types/payroll';

export const INITIAL_START_DATE = '2026-07-20';

export function formatDateDDMM(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

// Retorna las semanas iniciales exactas del cuaderno de notas
export function getInitialWeeks(): WeekPeriod[] {
  const startDate = new Date(2026, 6, 20); // 20 de Julio de 2026
  const totalWeeks = 13;
  const weeks: WeekPeriod[] = [];

  for (let i = 0; i < totalWeeks; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + i * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekNum = i + 1;
    let status: WeekStatus = 'pagada';
    let note = '';
    let isCurrentWeek = false;

    if (weekNum === 1) {
      status = 'fondo';
      note = 'Semana 1 de Fondo retenida';
    } else if (weekNum >= 2 && weekNum <= 4) {
      status = 'pagada';
      note = 'Cobrada ✓';
    } else if (weekNum >= 5 && weekNum <= 10) {
      status = 'mora';
      note = 'Debida con mora 20% ✗';
    } else if (weekNum === 11) {
      status = 'pagada';
      note = 'Cobrada / Cerrada';
    } else if (weekNum === 12) {
      status = 'normal';
      note = 'Vencida semana pasada (cobro normal este viernes)';
    } else if (weekNum === 13) {
      status = 'no_exigible';
      note = 'Semana en curso actual';
      isCurrentWeek = true;
    }

    weeks.push({
      id: weekNum,
      number: weekNum,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      formattedRange: `${formatDateDDMM(weekStart)} al ${formatDateDDMM(weekEnd)}`,
      payDate: `Viernes ${formatDateDDMM(weekEnd)}`,
      payDateShort: formatDateDDMM(weekEnd),
      status,
      note,
      isCurrentWeek,
    });
  }

  return weeks;
}

// Revisa la fecha actual y agrega automáticamente semanas que hayan transcurrido
export function getWeeksWithAutoProgression(savedWeeks: WeekPeriod[] = []): WeekPeriod[] {
  const baseWeeks = savedWeeks.length > 0 ? [...savedWeeks] : getInitialWeeks();
  const startDate = new Date(2026, 6, 20);
  const now = new Date(); // Fecha actual del sistema

  // Calcular número de semanas transcurridas desde el 20/07/2026
  const diffTime = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentWeekIndex = Math.max(0, Math.floor(diffDays / 7)); // Semana 1 es index 0
  const totalWeeksNeeded = Math.max(13, currentWeekIndex + 1);

  // Agregar nuevas semanas automáticamente si la fecha actual ya superó la semana 13
  for (let i = baseWeeks.length; i < totalWeeksNeeded; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + i * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekNum = i + 1;
    const isCurrent = i === currentWeekIndex;

    baseWeeks.push({
      id: weekNum,
      number: weekNum,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      formattedRange: `${formatDateDDMM(weekStart)} al ${formatDateDDMM(weekEnd)}`,
      payDate: `Viernes ${formatDateDDMM(weekEnd)}`,
      payDateShort: formatDateDDMM(weekEnd),
      status: isCurrent ? 'no_exigible' : 'normal',
      note: isCurrent ? 'Semana en curso actual' : 'Semana vencida',
      isCurrentWeek: isCurrent,
    });
  }

  // Actualizar bandera isCurrentWeek
  return baseWeeks.map((w, idx) => ({
    ...w,
    isCurrentWeek: idx === currentWeekIndex,
  }));
}

// Permite añadir manualmente la siguiente semana
export function appendNextWeek(existingWeeks: WeekPeriod[]): WeekPeriod[] {
  const startDate = new Date(2026, 6, 20);
  const nextIndex = existingWeeks.length;
  const weekStart = new Date(startDate);
  weekStart.setDate(startDate.getDate() + nextIndex * 7);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekNum = nextIndex + 1;

  // Marcar la anterior como no corriente y la nueva como en curso
  const updated = existingWeeks.map((w) => ({ ...w, isCurrentWeek: false }));

  updated.push({
    id: weekNum,
    number: weekNum,
    startDate: weekStart.toISOString().split('T')[0],
    endDate: weekEnd.toISOString().split('T')[0],
    formattedRange: `${formatDateDDMM(weekStart)} al ${formatDateDDMM(weekEnd)}`,
    payDate: `Viernes ${formatDateDDMM(weekEnd)}`,
    payDateShort: formatDateDDMM(weekEnd),
    status: 'no_exigible',
    note: 'Semana en curso agregada',
    isCurrentWeek: true,
  });

  return updated;
}

export function calculateWeeklyFromMonthly(monthly: number): number {
  return monthly > 0 ? monthly / 4 : 0;
}

export function calculateMonthlyFromWeekly(weekly: number): number {
  return weekly > 0 ? weekly * 4 : 0;
}
