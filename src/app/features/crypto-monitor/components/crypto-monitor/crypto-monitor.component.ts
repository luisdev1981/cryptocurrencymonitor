/**
 * Crypto Monitor Component (Smart/Container)
 * 
 * Componente principal que orquesta toda la lógica de la aplicación.
 * 
 * Explicación Feynman:
 * Este es el "cerebro" de la aplicación. Es un componente "inteligente" que:
 * 1. Se comunica con servicios para obtener datos
 * 2. Gestiona el estado usando Signals
 * 3. Se comunica con el Web Worker para cálculos
 * 4. Pasa datos a componentes "tontos" (presentacionales)
 * 
 * Es como el director de una orquesta - coordina todo pero no toca instrumentos.
 */

import { Component, OnInit, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CryptoDataService } from '../../../../core/services/crypto-data.service';
import { WebWorkerService } from '../../../../core/services/web-worker.service';
import { CryptoAsset } from '../../../../core/models/crypto-asset.model';
import { CryptoCardComponent } from '../crypto-card/crypto-card.component';
import { AlertConfigComponent } from '../alert-config/alert-config.component';

@Component({
  selector: 'app-crypto-monitor',
  standalone: true,
  imports: [CommonModule, CryptoCardComponent, AlertConfigComponent],
  templateUrl: './crypto-monitor.component.html',
  styleUrl: './crypto-monitor.component.css'
})
export class CryptoMonitorComponent implements OnInit, OnDestroy {
  private statsSubscription?: Subscription;

  // Inject services using inject() function to avoid initialization order issues
  private cryptoDataService = inject(CryptoDataService);
  private workerService = inject(WebWorkerService);

  /**
   * Acceso a los signals del servicio
   * Los signals se actualizan automáticamente cuando cambian los datos
   */
  assets = this.cryptoDataService.assets;
  topGainers = this.cryptoDataService.topGainers;
  topLosers = this.cryptoDataService.topLosers;
  triggeredAlerts = this.cryptoDataService.triggeredAlerts;

  /**
   * Signal de estado de conexión
   */
  isConnected = this.cryptoDataService.isConnected;

  constructor() {
    /**
     * Effect: Se ejecuta automáticamente cuando los assets cambian
     */
    effect(() => {
      const currentAssets = this.assets();

      currentAssets.forEach(asset => {
        if (asset.priceHistory.length >= 2) {
          this.workerService.calculateStats(
            asset.id,
            asset.priceHistory,
            10
          );
        }
      });
    });
  }

  ngOnInit(): void {
    /**
     * Suscribirse a los resultados del Web Worker
     * 
     * Explicación Feynman:
     * Aquí nos "suscribimos" a las respuestas del worker. Es como darle
     * tu número de teléfono a alguien para que te llame cuando tenga
     * los resultados listos.
     */
    this.statsSubscription = this.workerService.stats$.subscribe(result => {
      // Actualizar el activo con las estadísticas calculadas
      this.cryptoDataService.updateAssetStats(
        result.assetId,
        result.movingAverage,
        result.volatility
      );
    });
  }

  /**
   * Alterna el estado de las actualizaciones (Pausar/Reanudar)
   */
  toggleUpdates(): void {
    this.cryptoDataService.toggleUpdates();
  }

  /**
   * Maneja el cambio de umbral de alerta
   * 
   * @param event Evento con assetId y threshold
   */
  onThresholdChanged(event: { assetId: string; threshold: number | undefined }): void {
    this.cryptoDataService.setAlertThreshold(event.assetId, event.threshold);
  }

  /**
   * Obtiene el número de alertas configuradas
   */
  getConfiguredAlertsCount(): number {
    return this.assets().filter(a => a.alertThreshold !== undefined).length;
  }

  /**
   * trackBy function para optimización de renderizado
   * 
   * Explicación Feynman:
   * trackBy le dice a Angular cómo identificar cada elemento de la lista.
   * Es como darle a cada estudiante un número de identificación - Angular
   * puede saber rápidamente qué cambió sin tener que revisar todo.
   * 
   * Sin trackBy, Angular recrearía todos los elementos del DOM cada vez.
   * Con trackBy, solo actualiza los que realmente cambiaron.
   * 
   * @param index Índice del elemento
   * @param asset Activo
   * @returns ID único del activo
   */
  trackByAssetId(index: number, asset: CryptoAsset): string {
    return asset.id;
  }

  ngOnDestroy(): void {
    if (this.statsSubscription) {
      this.statsSubscription.unsubscribe();
    }
  }
}
