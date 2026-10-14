import React, { useState } from 'react';
import { RefreshCw, Edit2, Check } from 'lucide-react';
import { BcvRateInfo } from '../types/payroll';
import { formatVES } from '../utils/bcv';

interface BcvRateBannerProps {
  bcvInfo: BcvRateInfo;
  onRefresh: () => void;
  onUpdateRate: (newRate: number) => void;
}

export const BcvRateBanner: React.FC<BcvRateBannerProps> = ({
  bcvInfo,
  onRefresh,
  onUpdateRate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempRate, setTempRate] = useState(bcvInfo.rate.toString());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(tempRate.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateRate(parsed);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Tasa Oficial BCV ({bcvInfo.isManual ? 'Personalizada' : 'Banco Central de Venezuela'})
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="flex items-center gap-2 mt-1.5">
              <span className="text-sm font-semibold text-slate-400">Bs.</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={tempRate}
                onChange={(e) => setTempRate(e.target.value)}
                className="w-32 px-2.5 py-1 text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 rounded-md"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempRate(bcvInfo.rate.toString());
                  setIsEditing(false);
                }}
                className="px-2 py-1 text-xs text-slate-500"
              >
                Cancelar
              </button>
            </form>
          ) : (
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {formatVES(bcvInfo.rate)}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ 1 USD</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setTempRate(bcvInfo.rate.toString());
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors min-h-[36px]"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Cambiar Tasa</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={bcvInfo.isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors min-h-[36px] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${bcvInfo.isLoading ? 'animate-spin' : ''}`} />
            <span>{bcvInfo.isLoading ? 'Consultando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
