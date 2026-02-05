/**
 * StatsResult Model
 * 
 * Resultado de los cálculos estadísticos realizados por el Web Worker.
 * 
 * Explicación Feynman:
 * Este es el "reporte" que nos devuelve nuestro asistente (Web Worker)
 * después de hacer los cálculos complejos. Es como cuando le pides a alguien
 * que calcule el promedio y la desviación estándar de tus notas, y te devuelve
 * los resultados en un papel.
 */

export interface StatsResult {
  /** ID del activo al que pertenecen estas estadísticas */
  assetId: string;

  /** 
   * Promedio Móvil Simple (SMA - Simple Moving Average)
   * 
   * Fórmula: SMA = (P1 + P2 + ... + Pn) / n
   * 
   * Es el promedio de los últimos N precios. Nos ayuda a ver la "tendencia"
   * sin que los saltos bruscos nos confundan. Como promediar tus últimas
   * 5 calificaciones en lugar de solo mirar la última.
   */
  movingAverage: number;

  /** 
   * Volatilidad (Desviación Estándar)
   * 
   * Fórmula: σ = √(Σ(xi - μ)² / n)
   * 
   * Mide qué tan "dispersos" están los precios. Un valor alto significa que
   * el precio salta mucho (riesgoso), un valor bajo significa que es estable.
   * Como medir si tus notas son todas parecidas (70, 72, 71) o muy diferentes (50, 90, 60).
   */
  volatility: number;

  /** Número de datos usados en el cálculo */
  dataPoints: number;

  /** Timestamp del cálculo */
  timestamp: number;
}

/**
 * Mensaje enviado al Web Worker para solicitar cálculos
 */
export interface WorkerRequest {
  /** Tipo de operación a realizar */
  type: 'calculate-stats';

  /** ID del activo */
  assetId: string;

  /** Array de precios históricos */
  priceHistory: number[];

  /** Ventana para el promedio móvil (ej: últimos 10 precios) */
  windowSize?: number;
}

/**
 * Mensaje recibido del Web Worker con los resultados
 */
export interface WorkerResponse {
  /** Tipo de respuesta */
  type: 'stats-result' | 'error' | 'ready';

  /** Datos del resultado (si type es 'stats-result') */
  data?: StatsResult;

  /** Mensaje de error (si type es 'error') */
  error?: string;
}
