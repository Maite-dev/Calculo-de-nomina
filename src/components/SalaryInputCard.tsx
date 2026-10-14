import React from 'react';
import { RotateCcw } from 'lucide-react';
import { formatUSD, formatVES } from '../utils/bcv';

interface SalaryInputCardProps {
  monthlySalaryInput: string;
  onMonthlySalaryInputChange: (val: string) => void;
  weeklySalaryInput: string;
  onWeeklySalaryInputChange: (val: string) => void;
  onClear: () => void;
  bcvRate: number;

  moraWeeksCount: number;
  moraPercentage: number;
  normalWeeksCount: number;
  includeFondo: boolean;
  onIncludeFondoChange: (val: boolean) => void;

  weeklySalary: number;
}

export const SalaryInputCard: React.FC<SalaryInputCardProps> = ({
  monthlySalaryInput,
  onMonthlySalaryInputChange,
  weeklySalaryInput,
  onWeeklySalaryInputChange,
  onClear,
  bcvRate,
  moraWeeksCount,
  moraPercentage,
  normalWeeksCount,
  includeFondo,
  onIncludeFondoChange,
  weeklySalary,
}) => {
  const isCustomSalary = weeklySalary > 0;
  const sampleWeekly = isCustomSalary ? weeklySalary : 250;
  const moraPerWeek = sampleWeekly * (moraPercentage / 100);
  const totalMoraPerWeek = sampleWeekly + moraPerWeek;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
      {/* Header with Title and Clear Button */}
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Ingresa tu Salario
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors min-h-[36px]"
          title="Borrar salarios para escribir un monto nuevo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Borrar Montos</span>
        </button>
      </div>

      {/* Salary Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Monthly Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Salario Mensual ($ USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              $
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={monthlySalaryInput}
              onChange={(e) => onMonthlySalaryInputChange(e.target.value)}
              placeholder="Ej: 1000"
              className="w-full pl-8 pr-3 py-2.5 text-lg font-mono font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 min-h-[46px]"
            />
          </div>
          <span className="block text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
            {monthlySalaryInput ? `Equivale a ${formatVES((parseFloat(monthlySalaryInput) || 0) * bcvRate)}` : 'Escribe tu monto mensual (ej: 1000)'}
          </span>
        </div>

        {/* Weekly Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Salario Semanal ($ USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              $
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={weeklySalaryInput}
              onChange={(e) => onWeeklySalaryInputChange(e.target.value)}
              placeholder="Ej: 250"
              className="w-full pl-8 pr-3 py-2.5 text-lg font-mono font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 min-h-[46px]"
            />
          </div>
          <span className="block text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
            {weeklySalary > 0 ? `Equivale a ${formatVES(weeklySalary * bcvRate)} / semana` : 'O escribe directo tu monto semanal (ej: 250)'}
          </span>
        </div>
      </div>

      {/* Rule explanation note: shows clear $1000 example when cleared */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-950 font-medium space-y-1">
        <div>
          <strong>Regla de mora:</strong> Cada semana atrasada se paga al 20% del valor base.
        </div>
        <div className="font-mono text-[11px] text-amber-900">
          {isCustomSalary ? (
            <span>
              Ejemplo con tu salario: {formatUSD(sampleWeekly)} semana + 20% mora ({formatUSD(moraPerWeek)}) = <strong>{formatUSD(totalMoraPerWeek)}</strong> por semana
            </span>
          ) : (
            <span>
              Ejemplo con $1.000 mensual ($250 semanal): $250 semana + 20% mora ($50) = <strong>$300</strong> por semana
            </span>
          )}
        </div>
      </div>

      {/* Live counts summary */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          <div className="text-[10px] uppercase font-sans font-bold text-amber-800">
            Semanas con Mora (20%)
          </div>
          <div className="font-bold text-sm text-amber-950 mt-0.5">
            {moraWeeksCount} sem {weeklySalary > 0 ? `= ${formatUSD(moraWeeksCount * totalMoraPerWeek)}` : ''}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
          <div className="text-[10px] uppercase font-sans font-bold text-blue-800">
            Semanas Normales
          </div>
          <div className="font-bold text-sm text-blue-950 mt-0.5">
            {normalWeeksCount} sem {weeklySalary > 0 ? `= ${formatUSD(normalWeeksCount * weeklySalary)}` : ''}
          </div>
        </div>
      </div>

      {/* Semana de Fondo Toggle - without shield icon, clean + Cobrar Fondo */}
      <div className="bg-slate-100 rounded-lg p-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-slate-900">
            Semana 1 de Fondo ({weeklySalary > 0 ? `Retenida: ${formatUSD(weeklySalary)}` : 'Retenida en reserva'})
          </div>
          <div className="text-[11px] text-slate-500">
            {includeFondo
              ? 'Se está sumando a la cuenta para cobro.'
              : 'Se mantiene retenida en reserva.'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onIncludeFondoChange(!includeFondo)}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap min-h-[38px] ${
            includeFondo
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-slate-300 text-slate-700'
          }`}
        >
          {includeFondo ? 'Sumada ✓' : '+ Cobrar Fondo'}
        </button>
      </div>
    </div>
  );
};
