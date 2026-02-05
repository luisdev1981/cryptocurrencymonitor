/**
 * Alert Config Component (Presentational/Dumb)
 * 
 * Componente para configurar umbrales de alerta.
 * 
 * Explicación Feynman:
 * Este componente es como un "panel de control" donde el usuario puede
 * establecer alertas de precio. Cuando el precio supera el umbral,
 * la tarjeta cambia de estilo visual.
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CryptoAsset } from '../../../../core/models/crypto-asset.model';

@Component({
  selector: 'app-alert-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alert-config.component.html',
  styleUrl: './alert-config.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertConfigComponent {
  /**
   * Lista de activos para configurar alertas
   */
  @Input({ required: true }) assets: CryptoAsset[] = [];

  /**
   * Evento emitido cuando se cambia un umbral
   */
  @Output() thresholdChanged = new EventEmitter<{ assetId: string; threshold: number | undefined }>();

  /**
   * Maneja el cambio de umbral
   */
  onThresholdChange(assetId: string, value: string): void {
    let threshold = value ? parseFloat(value) : undefined;
    this.thresholdChanged.emit({ assetId, threshold });
  }

  /**
   * Limpia el umbral de un activo
   */
  clearThreshold(assetId: string): void {
    this.thresholdChanged.emit({ assetId, threshold: undefined });
  }
}
