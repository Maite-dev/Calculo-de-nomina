export interface DolarApiResponse {
  moneda: string;
  fuente: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}

export const DEFAULT_BCV_RATE = 877.90; // Current rate observed from BCV API for 2026

export async function fetchBcvRate(): Promise<{ rate: number; date: string; success: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data: DolarApiResponse = await res.json();
    if (data && typeof data.promedio === 'number' && data.promedio > 0) {
      return {
        rate: data.promedio,
        date: data.fechaActualizacion || new Date().toISOString(),
        success: true,
      };
    }
    throw new Error('Formato de tasa inválido');
  } catch (err) {
    console.warn('Error fetching live BCV rate, using fallback default:', err);
    return {
      rate: DEFAULT_BCV_RATE,
      date: new Date().toISOString(),
      success: false,
    };
  }
}

export function formatVES(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('VES', 'Bs.');
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
