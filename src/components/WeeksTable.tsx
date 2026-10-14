import React, { useState } from 'react';
import { WeekPeriod, WeekStatus } from '../types/payroll';
import { formatUSD, formatVES } from '../utils/bcv';
import { RotateCcw, Check, X, Clock, Plus } from 'lucide-react';

interface WeeksTableProps {
  weeks: WeekPeriod[];
  onUpdateWeekStatus: (id: number, newStatus: WeekStatus) => void;
  onResetData: () => void;
  onAddNextWeek: () => void;
  onRemoveWeek: (id: number) => void;
  weeklySalaryUSD: number;
  bcvRate: number;
  moraPercentage: number;
  includeFondo: boolean;
  onIncludeFondoChange: (val: boolean) => void;
  resetFeedback: string | null;
}

export const WeeksTable: React.FC<WeeksTableProps> = ({
  weeks,
  onUpdateWeekStatus,
  onResetData,
  onAddNextWeek,
  onRemoveWeek,
  weeklySalaryUSD,
  bcvRate,
  moraPercentage,
  includeFondo,
  onIncludeFondoChange,
  resetFeedback,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending'>('all');

  const filteredWeeks = weeks.filter((w) => {
    if (filter === 'pending') {
      return w.status === 'mora' || w.status === 'normal' || (w.number === 1 && includeFondo);
    }
    return true;
  });

  const calculateAmounts = (week: WeekPeriod) => {
    const base = weeklySalaryUSD;
    let mora = 0;
    let total = 0;

    if (week.number === 1) {
      total = includeFondo ? base : 0;
    } else if (week.status === 'mora') {
      mora = base * (moraPercentage / 100);
      total = base + mora;
    } else if (week.status === 'normal') {
      total = base;
    }

    return {
      base,
      mora,
      total,
      totalVES: total * bcvRate,
    };
  };

  const handleToggle = (weekId: number, currentStatus: WeekStatus, targetStatus: WeekStatus) => {
    if (currentStatus === targetStatus) {
      onUpdateWeekStatus(weekId, 'unselected');
    } else {
      onUpdateWeekStatus(weekId, targetStatus);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Cronograma Semana a Semana
          </h3>
          <p className="text-xs text-slate-500">
            Toca directamente cada botón para definir si está cobrada, con mora o normal.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          {/* Filters */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Todas ({weeks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'pending' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Por cobrar
            </button>
          </div>

          {/* Reset Button: Restablecer Datos */}
          <button
            type="button"
            onClick={onResetData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 rounded-lg transition-colors min-h-[34px]"
            title="Restablecer datos y dejar todo libre para seleccionar"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Restablecer Datos</span>
          </button>
        </div>
      </div>

      {/* Visual confirmation feedback when reset is pressed */}
      {resetFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resetFeedback}</span>
        </div>
      )}

      {/* Week Cards List */}
      <div className="space-y-3">
        {filteredWeeks.map((week) => {
          const isWeek1 = week.number === 1;
          const isAddedWeek = week.number > 13;
          const { base, mora, total, totalVES } = calculateAmounts(week);
          const isMora = !isWeek1 && week.status === 'mora';
          const isNormal = !isWeek1 && week.status === 'normal';
          const isPaid = !isWeek1 && week.status === 'pagada';
          const isNoExigible = !isWeek1 && week.status === 'no_exigible';
          const isUnselected = !isWeek1 && (week.status === 'unselected' || (!isMora && !isNormal && !isPaid && !isNoExigible));

          return (
            <div
              key={week.id}
              className={`group relative p-3.5 rounded-xl border transition-colors ${
                isWeek1
                  ? includeFondo
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                    : 'bg-slate-50 border-slate-200'
                  : isMora
                  ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                  : isNormal
                  ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                  : isPaid
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              {/* If it is an added week (Semana > 13), show remove button on hover / touch */}
              {isAddedWeek && (
                <button
                  type="button"
                  onClick={() => onRemoveWeek(week.id)}
                  className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  title="Eliminar esta semana agregada"
                  aria-label="Eliminar semana"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Card top row */}
              <div className="flex items-center justify-between gap-2 mb-2.5 pr-6 sm:pr-0">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">
                      Semana {week.number}
                    </span>
                    <span className="text-xs font-mono text-slate-600 font-medium">
                      {week.formattedRange}
                    </span>
                    {isWeek1 && (
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-sm">
                        Semana de Fondo
                      </span>
                    )}
                    {week.isCurrentWeek && (
                      <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-sm">
                        En curso actual
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Fecha corte de pago: {week.payDate}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {total > 0 ? (
                    <div>
                      <div className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                        {formatUSD(total)}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-700 font-semibold tabular-nums">
                        {formatVES(totalVES)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-semibold">
                      {isWeek1 ? (
                        <span className="text-slate-500">En reserva ($0.00)</span>
                      ) : isPaid ? (
                        <span className="text-emerald-700">Cobrada ✓</span>
                      ) : isUnselected ? (
                        <span className="text-slate-400 font-normal">Sin definir</span>
                      ) : (
                        <span className="text-slate-500">$0.00</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS: */}
              {isWeek1 ? (
                /* SEMANA 1: UN SOLO BOTÓN SIN ESCUDO */
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onIncludeFondoChange(!includeFondo)}
                    className={`w-full py-2.5 px-3 text-xs font-bold rounded-lg flex items-center justify-center transition-colors min-h-[40px] ${
                      includeFondo
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-800'
                    }`}
                  >
                    <span>
                      {includeFondo
                        ? `Fondo en Liquidación (Cobrar ${weeklySalaryUSD > 0 ? formatUSD(weeklySalaryUSD) : ''}) ✓`
                        : `+ Cobrar Fondo ${weeklySalaryUSD > 0 ? `(${formatUSD(weeklySalaryUSD)})` : ''}`}
                    </span>
                  </button>
                </div>
              ) : (
                /* OTRAS SEMANAS: 3 BOTONES DE 1 TOQUE (TOGGLEABLES) */
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {/* Button: Cobrada */}
                  <button
                    type="button"
                    onClick={() => handleToggle(week.id, week.status, 'pagada')}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all min-h-[38px] ${
                      isPaid
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 active:bg-slate-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Cobrada</span>
                  </button>

                  {/* Button: Con Mora */}
                  <button
                    type="button"
                    onClick={() => handleToggle(week.id, week.status, 'mora')}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all min-h-[38px] ${
                      isMora
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-100/60 active:bg-amber-200/60'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Mora +20%</span>
                  </button>

                  {/* Button: Normal */}
                  <button
                    type="button"
                    onClick={() => handleToggle(week.id, week.status, 'normal')}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all min-h-[38px] ${
                      isNormal
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-100/60 active:bg-blue-200/60'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Normal</span>
                  </button>
                </div>
              )}

              {/* Detail sub-row if mora */}
              {isMora && (
                <div className="mt-2.5 pt-2 border-t border-amber-200 flex items-center justify-between text-[11px] text-amber-950 font-mono">
                  <span>Base {formatUSD(base)} + 20% Mora ({formatUSD(mora)})</span>
                  <span className="font-bold">Total: {formatUSD(total)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Button to add the next week */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onAddNextWeek}
          className="w-full py-3 px-4 border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors min-h-[46px]"
        >
          <Plus className="w-4 h-4 text-slate-600" />
          <span>Añadir Semana Siguiente (Semana {weeks.length + 1})</span>
        </button>
      </div>
    </div>
  );
};
