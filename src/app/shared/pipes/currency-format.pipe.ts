/**
 * Currency Format Pipe
 * 
 * Pipe personalizado para formatear precios de criptomonedas.
 * 
 * Explicación Feynman:
 * Un pipe es como un "filtro" que transforma datos para mostrarlos.
 * Este pipe toma un número (ej: 43250.5) y lo convierte en un formato
 * bonito para mostrar (ej: "$43,250.50").
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cryptoCurrency',
  standalone: true
})
export class CryptoCurrencyPipe implements PipeTransform {
  /**
   * Transforma un número en formato de moneda
   * 
   * @param value Valor numérico
   * @param decimals Número de decimales (default: 2)
   * @returns String formateado
   */
  transform(value: number | undefined, decimals: number = 2): string {
    if (value === undefined || value === null) {
      return '$0.00';
    }

    // Para precios muy pequeños (< $1), mostrar más decimales
    const effectiveDecimals = value < 1 ? 4 : decimals;

    // Formatear con separadores de miles y decimales
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: effectiveDecimals,
      maximumFractionDigits: effectiveDecimals
    }).format(value);
  }
}
