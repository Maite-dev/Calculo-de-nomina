import React from 'react';
import { Copy, FileText } from 'lucide-react';

interface HeaderProps {
  onOpenSummary: () => void;
  totalUSD: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSummary, totalUSD }) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand / Title */}
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
            Control de Nómina
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-600 font-medium">Inicio del proyecto 20/07/2026</span>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenSummary}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 active:bg-slate-800 rounded-lg transition-colors whitespace-nowrap min-h-[36px]"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Ver Resumen</span>
        </button>
      </div>
    </header>
  );
};
