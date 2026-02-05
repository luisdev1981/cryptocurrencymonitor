/**
 * Crypto Card Component (Presentational/Dumb)
 * 
 * Componente que muestra la información de una criptomoneda individual.
 * 
 * Explicación Feynman:
 * Este es un componente "tonto" - solo muestra lo que le dicen, no toma decisiones.
 * Es como una pantalla de TV que muestra lo que recibe, pero no decide qué mostrar.
 * 
 * Características:
 * - Recibe datos via @Input (no los genera)
 * - Usa OnPush para optimización (solo se actualiza cuando los inputs cambian)
 * - Usa la directiva appHighlightChange para animaciones
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CryptoAsset } from '../../../../core/models/crypto-asset.model';
import { HighlightChangeDirective } from '../../directives/highlight-change.directive';
import { CryptoCurrencyPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-crypto-card',
  standalone: true,
  imports: [CommonModule, HighlightChangeDirective, CryptoCurrencyPipe],
  templateUrl: './crypto-card.component.html',
  styleUrl: './crypto-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush // ⚡ Optimización: solo actualiza cuando inputs cambian
})
export class CryptoCardComponent {
  /**
   * Datos del activo a mostrar
   * El componente padre (smart) le pasa estos datos
   */
  @Input({ required: true }) asset!: CryptoAsset;

  /**
   * Genera el mensaje de alerta explicando por qué se activó
   * 
   * @returns Mensaje descriptivo de la alerta
   */
  getAlertMessage(): string {
    if (!this.asset.isAlertTriggered || this.asset.alertThreshold === undefined) {
      return '';
    }

    const currentPrice = this.asset.price.toFixed(2);
    const threshold = this.asset.alertThreshold.toFixed(2);

    return `El precio de ${this.asset.name} ($${currentPrice}) ha superado el umbral configurado de $${threshold}`;
  }
}
