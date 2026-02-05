/**
 * Web Worker para Cálculos Estadísticos de Criptomonedas
 * 
 * Explicación Feynman:
 * Un Web Worker es como contratar un asistente que trabaja en una oficina separada.
 * Mientras tú (el hilo principal) atiendes a los clientes (la UI), tu asistente
 * hace los cálculos complejos sin interrumpirte. Cuando termina, te envía los resultados.
 * 
 * ¿Por qué es importante?
 * Si hiciéramos estos cálculos en el hilo principal, la página se "congelaría"
 * mientras calcula. Con el worker, la UI sigue siendo fluida y responsive.
 */

import { WorkerRequest, WorkerResponse, StatsResult } from '../models/stats-result.model';

/**
 * Calcula el Promedio Móvil Simple (SMA)
 * 
 * Explicación Feynman:
 * Imagina que quieres saber tu promedio de calificaciones, pero solo de los últimos
 * 5 exámenes (no todos los del año). Eso es un promedio móvil.
 * 
 * En criptomonedas, nos ayuda a ver la "tendencia" del precio sin que los saltos
 * bruscos nos confundan. Si el precio fue: 100, 105, 103, 108, 110, el promedio
 * móvil sería (100+105+103+108+110)/5 = 105.2
 * 
 * @param prices Array de precios históricos
 * @param windowSize Tamaño de la ventana (cuántos precios promediar)
 * @returns Promedio móvil
 */
function calculateMovingAverage(prices: number[], windowSize: number = 10): number {
  if (prices.length === 0) return 0;

  // Si tenemos menos datos que el tamaño de ventana, usamos todos los datos
  const effectiveWindow = Math.min(windowSize, prices.length);

  // Tomamos los últimos N precios
  const recentPrices = prices.slice(-effectiveWindow);

  // Sumamos todos los precios
  const sum = recentPrices.reduce((acc, price) => acc + price, 0);

  // Dividimos por la cantidad de precios
  return sum / recentPrices.length;
}

/**
 * Calcula la Volatilidad (Desviación Estándar)
 * 
 * Explicación Feynman:
 * La volatilidad mide qué tan "salvaje" o "estable" es el precio.
 * 
 * Imagina dos estudiantes:
 * - Estudiante A: notas de 70, 72, 71, 69, 73 (muy consistente)
 * - Estudiante B: notas de 50, 90, 60, 95, 55 (muy inconsistente)
 * 
 * Ambos pueden tener el mismo promedio (71), pero el estudiante B tiene
 * mayor "volatilidad" - sus notas saltan mucho.
 * 
 * En criptomonedas:
 * - Alta volatilidad = precio salta mucho (más riesgoso, pero más oportunidades)
 * - Baja volatilidad = precio estable (menos riesgoso, pero menos oportunidades)
 * 
 * Fórmula: σ = √(Σ(xi - μ)² / n)
 * Donde:
 * - xi = cada precio individual
 * - μ = promedio de todos los precios
 * - n = cantidad de precios
 * 
 * @param prices Array de precios históricos
 * @returns Volatilidad (desviación estándar)
 */
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;

  // Paso 1: Calcular el promedio (μ)
  const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;

  // Paso 2: Calcular la suma de las diferencias al cuadrado Σ(xi - μ)²
  // Para cada precio, restamos el promedio, elevamos al cuadrado, y sumamos
  const squaredDifferences = prices.reduce((acc, price) => {
    const difference = price - mean;
    return acc + (difference * difference);
  }, 0);

  // Paso 3: Dividir por n (varianza)
  const variance = squaredDifferences / prices.length;

  // Paso 4: Sacar la raíz cuadrada (desviación estándar)
  return Math.sqrt(variance);
}

/**
 * Procesa los mensajes recibidos del hilo principal
 * 
 * Explicación Feynman:
 * Este es el "buzón de entrada" del worker. Cuando el hilo principal
 * nos envía un mensaje pidiendo cálculos, este listener lo recibe,
 * hace los cálculos, y envía la respuesta de vuelta.
 */
self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;

  try {
    if (request.type === 'calculate-stats') {
      const { assetId, priceHistory, windowSize = 10 } = request;

      // Validación: necesitamos al menos 2 precios para calcular estadísticas
      if (!priceHistory || priceHistory.length < 2) {
        const errorResponse: WorkerResponse = {
          type: 'error',
          error: 'Insufficient price data for calculations'
        };
        self.postMessage(errorResponse);
        return;
      }

      // Realizar los cálculos
      const movingAverage = calculateMovingAverage(priceHistory, windowSize);
      const volatility = calculateVolatility(priceHistory);

      // Preparar el resultado
      const result: StatsResult = {
        assetId,
        movingAverage,
        volatility,
        dataPoints: priceHistory.length,
        timestamp: Date.now()
      };

      // Enviar respuesta al hilo principal
      const response: WorkerResponse = {
        type: 'stats-result',
        data: result
      };

      self.postMessage(response);
    }
  } catch (error) {
    // Si algo sale mal, enviamos un mensaje de error
    const errorResponse: WorkerResponse = {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error in worker'
    };
    self.postMessage(errorResponse);
  }
});

/**
 * Mensaje de inicialización
 * Esto confirma que el worker se cargó correctamente
 */
self.postMessage({ type: 'ready' });
