/**
 * Utilidad para simular fluctuaciones de precio realistas
 * 
 * Explicación Feynman:
 * Como no tenemos acceso constante a la API de Binance (tiene límites de requests),
 * simulamos cambios de precio realistas. Es como simular el movimiento de las olas
 * del mar - no es completamente aleatorio, tiene cierta "inercia" y tendencias.
 */

/**
 * Genera una fluctuación de precio realista
 * 
 * @param currentPrice Precio actual
 * @param volatilityFactor Factor de volatilidad (0.001 = 0.1%, 0.01 = 1%)
 * @returns Nuevo precio con fluctuación
 */
export function simulatePriceChange(
  currentPrice: number,
  volatilityFactor: number = 0.002
): number {
  // Generar un cambio aleatorio entre -volatilityFactor y +volatilityFactor
  // Math.random() genera un número entre 0 y 1
  // (Math.random() - 0.5) genera un número entre -0.5 y 0.5
  // Multiplicamos por 2 para obtener entre -1 y 1
  // Multiplicamos por volatilityFactor para escalar el cambio
  const randomChange = (Math.random() - 0.5) * 2 * volatilityFactor;

  // Aplicar el cambio al precio actual
  const newPrice = currentPrice * (1 + randomChange);

  // Redondear a 4 decimales para capturar variaciones en precios bajos (como ADA o XRP)
  return Math.round(newPrice * 10000) / 10000;
}

/**
 * Calcula el cambio porcentual entre dos precios
 * 
 * @param currentPrice Precio actual
 * @param previousPrice Precio anterior
 * @returns Cambio porcentual
 */
export function calculateChangePercent(
  currentPrice: number,
  previousPrice: number
): number {
  if (previousPrice === 0) return 0;

  const change = ((currentPrice - previousPrice) / previousPrice) * 100;

  // Redondear a 2 decimales
  return Math.round(change * 100) / 100;
}
