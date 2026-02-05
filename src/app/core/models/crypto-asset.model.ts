/**
 * CryptoAsset Model
 * 
 * Representa un activo de criptomoneda con toda su información relevante.
 * 
 * Explicación Feynman:
 * Este modelo es como una "ficha de información" de una criptomoneda.
 * Imagina que estás siguiendo el precio de acciones en la bolsa - necesitas
 * saber el nombre, el precio actual, el precio anterior (para ver si subió o bajó),
 * y un historial de precios para calcular tendencias.
 */

export interface CryptoAsset {
  /** Identificador único (ej: 'BTC', 'ETH') */
  id: string;

  /** Nombre completo de la criptomoneda (ej: 'Bitcoin', 'Ethereum') */
  name: string;

  /** Símbolo de trading (ej: 'BTC', 'ETH') */
  symbol: string;

  /** Precio actual en USD */
  price: number;

  /** Precio anterior - usado para detectar si subió o bajó */
  previousPrice: number;

  /** Cambio porcentual respecto al precio anterior */
  changePercent: number;

  /** 
   * Historial de precios - usado para calcular estadísticas
   * Como guardar tus últimas 20 calificaciones para calcular tu promedio
   */
  priceHistory: number[];

  /** 
   * Umbral de alerta definido por el usuario (opcional)
   * Si el precio supera este valor, se activa una alerta visual
   */
  alertThreshold?: number;

  /** Indica si la alerta está activa (precio superó el umbral) */
  isAlertTriggered: boolean;

  /** 
   * Promedio móvil calculado por el Web Worker
   * Es como el "promedio de tus últimas 10 notas" - te da una idea de la tendencia
   */
  movingAverage?: number;

  /** 
   * Volatilidad calculada por el Web Worker
   * Mide qué tan "salvaje" es el precio - si salta mucho o se mantiene estable
   */
  volatility?: number;

  /** Timestamp de la última actualización */
  lastUpdate: number;
}
