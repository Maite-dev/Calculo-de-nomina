import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { Header } from './components/Header';
import { BcvRateBanner } from './components/BcvRateBanner';
import { SalaryInputCard } from './components/SalaryInputCard';
import { CalculationSummary } from './components/CalculationSummary';
import { WeeksTable } from './components/WeeksTable';
import { ShareModal } from './components/ShareModal';
import {
  BcvRateInfo,
  PayrollCalculation,
  WeekPeriod,
  WeekStatus,
} from './types/payroll';
import { fetchBcvRate, DEFAULT_BCV_RATE, formatUSD, formatVES } from './utils/bcv';
import {
  getInitialWeeks,
  getWeeksWithAutoProgression,
  appendNextWeek,
  calculateWeeklyFromMonthly,
  calculateMonthlyFromWeekly,
} from './utils/dateCalculations';
import { generateVoucherDataUrl } from './utils/generateVoucherImage';

export default function App() {
  // Salario inputs (default 1200 mensual / 300 semanal)
  const [monthlyInput, setMonthlyInput] = useState<string>(() => {
    return localStorage.getItem('nomina_salario_mensual') || '1200';
  });

  const [weeklyInput, setWeeklyInput] = useState<string>(() => {
    return localStorage.getItem('nomina_salario_semanal') || '300';
  });

  const [moraPercentage] = useState<number>(20);
  const [includeFondo, setIncludeFondo] = useState<boolean>(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  // BCV Rate State
  const [bcvInfo, setBcvInfo] = useState<BcvRateInfo>({
    rate: DEFAULT_BCV_RATE,
    lastUpdated: '2026-10-14',
    source: 'Banco Central de Venezuela',
    isLoading: false,
    isManual: false,
  });

  // Weeks state with auto progression check
  const [weeks, setWeeks] = useState<WeekPeriod[]>(() => {
    const saved = localStorage.getItem('nomina_semanas_v4');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return getWeeksWithAutoProgression(parsed);
      } catch (e) {
        console.error('Error parsing stored weeks', e);
      }
    }
    return getWeeksWithAutoProgression(getInitialWeeks());
  });

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Fetch BCV on mount
  useEffect(() => {
    const loadBcv = async () => {
      setBcvInfo((prev) => ({ ...prev, isLoading: true }));
      const result = await fetchBcvRate();
      setBcvInfo({
        rate: result.rate,
        lastUpdated: result.date,
        source: 'Banco Central de Venezuela',
        isLoading: false,
        isManual: false,
      });
    };
    loadBcv();
  }, []);

  // Sync monthly <-> weekly inputs
  const handleMonthlyInputChange = (val: string) => {
    setMonthlyInput(val);
    if (val === '') {
      setWeeklyInput('');
      localStorage.setItem('nomina_salario_mensual', '');
      localStorage.setItem('nomina_salario_semanal', '');
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const weekly = calculateWeeklyFromMonthly(num);
      setWeeklyInput(weekly.toString());
      localStorage.setItem('nomina_salario_mensual', val);
      localStorage.setItem('nomina_salario_semanal', weekly.toString());
    }
  };

  const handleWeeklyInputChange = (val: string) => {
    setWeeklyInput(val);
    if (val === '') {
      setMonthlyInput('');
      localStorage.setItem('nomina_salario_mensual', '');
      localStorage.setItem('nomina_salario_semanal', '');
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const monthly = calculateMonthlyFromWeekly(num);
      setMonthlyInput(monthly.toString());
      localStorage.setItem('nomina_salario_mensual', monthly.toString());
      localStorage.setItem('nomina_salario_semanal', val);
    }
  };

  const handleClearSalary = () => {
    setMonthlyInput('');
    setWeeklyInput('');
    setIncludeFondo(false);
    localStorage.removeItem('nomina_salario_mensual');
    localStorage.removeItem('nomina_salario_semanal');
  };

  useEffect(() => {
    localStorage.setItem('nomina_semanas_v4', JSON.stringify(weeks));
  }, [weeks]);

  // Numeric values
  const monthlySalary = parseFloat(monthlyInput) || 0;
  const weeklySalary = parseFloat(weeklyInput) || 0;

  // Derived counts from weeks list
  const moraWeeksInTable = useMemo(() => weeks.filter((w) => w.status === 'mora').length, [weeks]);
  const normalWeeksInTable = useMemo(() => weeks.filter((w) => w.status === 'normal').length, [weeks]);

  // Calculations
  const calculation: PayrollCalculation = useMemo(() => {
    const moraBaseUSD = moraWeeksInTable * weeklySalary;
    const moraInterestUSD = moraBaseUSD * (moraPercentage / 100);
    const moraTotalUSD = moraBaseUSD + moraInterestUSD;

    const normalTotalUSD = normalWeeksInTable * weeklySalary;
    const fondoTotalUSD = includeFondo ? weeklySalary : 0;

    const totalToReceiveUSD = moraTotalUSD + normalTotalUSD + fondoTotalUSD;
    const totalToReceiveVES = totalToReceiveUSD * bcvInfo.rate;

    const totalWeeksWorked = weeks.length;
    const totalWeeksPaid = weeks.filter((w) => w.status === 'pagada').length;
    const totalWeeksPending = moraWeeksInTable + normalWeeksInTable + (includeFondo ? 1 : 0);

    return {
      monthlySalary,
      inputCurrency: 'USD',
      weeklySalaryUSD: weeklySalary,
      weeklySalaryVES: weeklySalary * bcvInfo.rate,
      dailySalaryUSD: weeklySalary / 7,
      dailySalaryVES: (weeklySalary / 7) * bcvInfo.rate,
      formula: 'div4',
      moraWeeksCount: moraWeeksInTable,
      moraPercentage,
      normalWeeksCount: normalWeeksInTable,
      includeFondo,
      moraBaseUSD,
      moraInterestUSD,
      moraTotalUSD,
      normalTotalUSD,
      fondoTotalUSD,
      totalToReceiveUSD,
      totalToReceiveVES,
      totalWeeksWorked,
      totalWeeksPaid,
      totalWeeksPending,
    };
  }, [monthlySalary, weeklySalary, moraWeeksInTable, normalWeeksInTable, moraPercentage, includeFondo, bcvInfo.rate, weeks]);

  // Update a single week's status
  const handleUpdateWeekStatus = (id: number, newStatus: WeekStatus) => {
    setWeeks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w))
    );
  };

  // Restablecer datos y dejar todo libre sin ninguna acción seleccionada
  const handleResetData = () => {
    const unselectedWeeks = weeks.map((w) => {
      if (w.number === 1) return { ...w, status: 'fondo' as WeekStatus };
      return { ...w, status: 'unselected' as WeekStatus };
    });
    setWeeks(unselectedWeeks);
    setIncludeFondo(false);
    localStorage.setItem('nomina_semanas_v4', JSON.stringify(unselectedWeeks));

    setResetFeedback('Datos restablecidos: Todo libre y sin seleccionar para que elijas tus opciones.');
    setTimeout(() => setResetFeedback(null), 4000);
  };

  // Agregar la siguiente semana
  const handleAddNextWeek = () => {
    setWeeks((prev) => appendNextWeek(prev));
  };

  // Eliminar semana añadida
  const handleRemoveWeek = (id: number) => {
    setWeeks((prev) => prev.filter((w) => w.id !== id));
  };

  const handleRefreshBcv = async () => {
    setBcvInfo((prev) => ({ ...prev, isLoading: true }));
    const result = await fetchBcvRate();
    setBcvInfo({
      rate: result.rate,
      lastUpdated: result.date,
      source: 'Banco Central de Venezuela',
      isLoading: false,
      isManual: false,
    });
  };

  const handleUpdateManualRate = (newRate: number) => {
    setBcvInfo({
      rate: newRate,
      lastUpdated: new Date().toISOString(),
      source: 'Tasa Manual Personalizada',
      isLoading: false,
      isManual: true,
    });
  };

  const handlePrint = () => {
    const url = generateVoucherDataUrl(calculation, bcvInfo.rate, weeks);
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
                img { max-width: 100%; height: auto; }
                @media print { body { padding: 0; } img { width: 100%; } }
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
    } catch (e) {
      console.warn(e);
    }
    window.focus();
    window.print();
  };

  const handleDownloadPng = () => {
    const url = generateVoucherDataUrl(calculation, bcvInfo.rate, weeks);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprobante_nomina_${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-10">
      <Header onOpenSummary={() => setIsShareModalOpen(true)} totalUSD={calculation.totalToReceiveUSD} />

      <main className="flex-1 max-w-2xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4">
        
        {/* Inicio del Proyecto */}
        <div className="flex items-center justify-between text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 shadow-2xs">
          <div className="flex items-center gap-2 font-semibold">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span>Inicio del proyecto 20/07/2026</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Semana 1 de fondo</span>
        </div>

        {/* Tasa Oficial BCV */}
        <BcvRateBanner
          bcvInfo={bcvInfo}
          onRefresh={handleRefreshBcv}
          onUpdateRate={handleUpdateManualRate}
        />

        {/* Resumen Principal de Cobro */}
        <CalculationSummary
          calc={calculation}
          bcvRate={bcvInfo.rate}
          onOpenSummaryModal={() => setIsShareModalOpen(true)}
          onDownloadPng={handleDownloadPng}
        />

        {/* Entradas de Salario */}
        <SalaryInputCard
          monthlySalaryInput={monthlyInput}
          onMonthlySalaryInputChange={handleMonthlyInputChange}
          weeklySalaryInput={weeklyInput}
          onWeeklySalaryInputChange={handleWeeklyInputChange}
          onClear={handleClearSalary}
          bcvRate={bcvInfo.rate}
          moraWeeksCount={moraWeeksInTable}
          moraPercentage={moraPercentage}
          normalWeeksCount={normalWeeksInTable}
          includeFondo={includeFondo}
          onIncludeFondoChange={setIncludeFondo}
          weeklySalary={weeklySalary}
        />

        {/* Cronograma detallado semana a semana */}
        <WeeksTable
          weeks={weeks}
          onUpdateWeekStatus={handleUpdateWeekStatus}
          onResetData={handleResetData}
          onAddNextWeek={handleAddNextWeek}
          onRemoveWeek={handleRemoveWeek}
          weeklySalaryUSD={weeklySalary}
          bcvRate={bcvInfo.rate}
          moraPercentage={moraPercentage}
          includeFondo={includeFondo}
          onIncludeFondoChange={setIncludeFondo}
          resetFeedback={resetFeedback}
        />

      </main>

      {/* Modal para copiar y enviar */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        calc={calculation}
        bcvRate={bcvInfo.rate}
        weeks={weeks}
        onPrint={handlePrint}
      />
    </div>
  );
}
