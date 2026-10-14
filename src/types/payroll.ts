export type WeekStatus = 'fondo' | 'pagada' | 'mora' | 'normal' | 'no_exigible' | 'unselected';

export interface WeekPeriod {
  id: number;
  number: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  formattedRange: string; // e.g. "20/07 - 26/07"
  payDate: string; // e.g. "Viernes 31/07" o fecha notebook
  payDateShort: string; // e.g. "26/07"
  status: WeekStatus;
  note?: string;
  isCurrentWeek?: boolean;
}

export type CalculationFormula = 'lottt' | 'div4' | 'div433';

export interface BcvRateInfo {
  rate: number;
  lastUpdated: string;
  source: string;
  isLoading: boolean;
  isManual: boolean;
  error?: string | null;
}

export interface PayrollCalculation {
  monthlySalary: number;
  inputCurrency: 'USD' | 'VES';
  weeklySalaryUSD: number;
  weeklySalaryVES: number;
  dailySalaryUSD: number;
  dailySalaryVES: number;
  formula: CalculationFormula;
  
  // Quick count inputs
  moraWeeksCount: number;
  moraPercentage: number;
  normalWeeksCount: number;
  includeFondo: boolean;
  
  // Results
  moraBaseUSD: number;
  moraInterestUSD: number;
  moraTotalUSD: number;
  
  normalTotalUSD: number;
  
  fondoTotalUSD: number;
  
  totalToReceiveUSD: number;
  totalToReceiveVES: number;
  
  totalWeeksWorked: number;
  totalWeeksPaid: number;
  totalWeeksPending: number;
}
