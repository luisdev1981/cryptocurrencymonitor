/**
 * Crypto Data Service
 * 
 * Servicio principal que gestiona el feed de precios en tiempo real.
 * 
 * Explicación Feynman:
 * Este servicio es como un "proveedor de noticias financieras" que actualiza
 * los precios constantemente. Usa Signals (la nueva forma de manejar estado en Angular)
 * para que cuando los precios cambien, todos los componentes que los usan
 * se actualicen automáticamente.
 * 
 * Arquitectura:
 * - Usa RxJS interval() para actualizar cada 200ms
 * - Integra con Binance API para precios reales
 * - Simula fluctuaciones cuando no puede acceder a la API
 * - Expone datos mediante Signals para reactividad eficiente
 */

import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { CryptoAsset } from '../models/crypto-asset.model';
import { simulatePriceChange, calculateChangePercent } from '../../shared/utils/price-simulator';

/**
 * Configuración de criptomonedas a monitorear
 */
interface CryptoConfig {
  id: string;
  name: string;
  symbol: string;
  binanceSymbol: string;
  initialPrice: number;
  volatility: number; // Factor de volatilidad para simulación
}

@Injectable({
  providedIn: 'root'
})
export class CryptoDataService implements OnDestroy {
  private updateSubscription?: Subscription;
  private readonly UPDATE_INTERVAL = 1000; // 1000ms como requiere el ejercicio
  private readonly PRICE_HISTORY_SIZE = 20; // Mantener últimos 20 precios

  /**
   * Configuración de las criptomonedas a monitorear
   * 
   * Explicación Feynman:
   * Esta es nuestra "lista de activos" que vamos a seguir. Cada uno tiene
   * un precio inicial y un factor de volatilidad (qué tan "salvaje" es su precio).
   * Bitcoin es menos volátil que altcoins pequeñas.
   */
  private readonly cryptoConfigs: CryptoConfig[] = [
    {
      id: 'BTC',
      name: 'Bitcoin',
      symbol: 'BTC',
      binanceSymbol: 'BTCUSDT',
      initialPrice: 43250.00,
      volatility: 0.002 // 0.2% de volatilidad
    },
    {
      id: 'ETH',
      name: 'Ethereum',
      symbol: 'ETH',
      binanceSymbol: 'ETHUSDT',
      initialPrice: 2280.50,
      volatility: 0.003 // 0.3% de volatilidad
    },
    {
      id: 'BNB',
      name: 'Binance Coin',
      symbol: 'BNB',
      binanceSymbol: 'BNBUSDT',
      initialPrice: 315.75,
      volatility: 0.004 // 0.4% de volatilidad
    },
    {
      id: 'SOL',
      name: 'Solana',
      symbol: 'SOL',
      binanceSymbol: 'SOLUSDT',
      initialPrice: 98.45,
      volatility: 0.005 // 0.5% de volatilidad
    },
    {
      id: 'ADA',
      name: 'Cardano',
      symbol: 'ADA',
      binanceSymbol: 'ADAUSDT',
      initialPrice: 0.52,
      volatility: 0.006 // 0.6% de volatilidad
    },
    {
      id: 'XRP',
      name: 'Ripple',
      symbol: 'XRP',
      binanceSymbol: 'XRPUSDT',
      initialPrice: 0.58,
      volatility: 0.005 // 0.5% de volatilidad
    }
  ];

  /**
   * Signal base - La "fuente de verdad" de nuestros datos
   * 
   * Explicación Feynman:
   * Un Signal es como una "variable inteligente" que avisa automáticamente
   * cuando cambia. Es más eficiente que los Observables de RxJS para
   * state management porque solo actualiza lo que realmente cambió.
   */
  private readonly rawAssets = signal<CryptoAsset[]>(this.initializeAssets());

  /**
   * Computed Signal - Top Gainers (criptos que subieron más de 5%)
   * 
   * Explicación Feynman:
   * Un computed signal es como una "fórmula de Excel" - se recalcula
   * automáticamente cuando los datos de entrada cambian. No tenemos
   * que llamarlo manualmente.
   */
  public readonly topGainers = computed(() => {
    return this.rawAssets()
      .filter(asset => asset.changePercent > 5)
      .sort((a, b) => b.changePercent - a.changePercent);
  });

  /**
   * Computed Signal - Top Losers (criptos que bajaron más de 5%)
   */
  public readonly topLosers = computed(() => {
    return this.rawAssets()
      .filter(asset => asset.changePercent < -5)
      .sort((a, b) => a.changePercent - b.changePercent);
  });

  /**
   * Computed Signal - Alertas activas
   */
  public readonly triggeredAlerts = computed(() => {
    return this.rawAssets().filter(asset => asset.isAlertTriggered);
  });

  /**
   * Exponer el signal de assets para que los componentes puedan leerlo
   */
  public readonly assets = this.rawAssets.asReadonly();

  /**
   * Signal de estado de conexión
   */
  public readonly isConnected = signal<boolean>(true);

  constructor() {
    this.startPriceUpdates();
  }

  /**
   * Inicializa los activos con valores por defecto
   */
  private initializeAssets(): CryptoAsset[] {
    return this.cryptoConfigs.map(config => ({
      id: config.id,
      name: config.name,
      symbol: config.symbol,
      price: config.initialPrice,
      previousPrice: config.initialPrice,
      changePercent: 0,
      priceHistory: [config.initialPrice],
      isAlertTriggered: false,
      lastUpdate: Date.now()
    }));
  }

  /**
   * Inicia las actualizaciones de precio cada 200ms
   */
  private startPriceUpdates(): void {
    if (this.updateSubscription && !this.updateSubscription.closed) {
      return;
    }

    this.updateSubscription = interval(this.UPDATE_INTERVAL).subscribe(() => {
      this.updatePrices();
    });

    this.isConnected.set(true);
    console.log(`✅ Price updates started (every ${this.UPDATE_INTERVAL}ms)`);
  }

  /**
   * Pausa las actualizaciones de precios
   */
  public pauseUpdates(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
      this.updateSubscription = undefined;
    }
    this.isConnected.set(false);
    console.log('⏸️ Price updates paused');
  }

  /**
   * Reanuda las actualizaciones de precios
   */
  public resumeUpdates(): void {
    this.startPriceUpdates();
  }

  /**
   * Alterna entre pausado y reanudado
   */
  public toggleUpdates(): void {
    if (this.isConnected()) {
      this.pauseUpdates();
    } else {
      this.resumeUpdates();
    }
  }

  /**
   * Actualiza los precios de todas las criptomonedas
   */
  private updatePrices(): void {
    const currentAssets = this.rawAssets();

    const updatedAssets = currentAssets.map((asset, index) => {
      const config = this.cryptoConfigs[index];

      // Guardar precio anterior
      const previousPrice = asset.price;

      // Simular nuevo precio con volatilidad específica
      const newPrice = simulatePriceChange(asset.price, config.volatility);

      // Calcular cambio porcentual
      const changePercent = calculateChangePercent(newPrice, previousPrice);

      // Actualizar historial de precios (mantener solo los últimos N)
      const updatedHistory = [...asset.priceHistory, newPrice];
      if (updatedHistory.length > this.PRICE_HISTORY_SIZE) {
        updatedHistory.shift(); // Remover el más antiguo
      }

      // Verificar si se activó la alerta
      const isAlertTriggered = asset.alertThreshold !== undefined &&
        newPrice >= asset.alertThreshold;

      return {
        ...asset,
        previousPrice,
        price: newPrice,
        changePercent,
        priceHistory: updatedHistory,
        isAlertTriggered,
        lastUpdate: Date.now()
      };
    });

    // Actualizar el signal - esto dispara actualizaciones en todos los computed signals
    this.rawAssets.set(updatedAssets);
  }

  /**
   * Establece un umbral de alerta para un activo específico
   */
  public setAlertThreshold(assetId: string, threshold: number | undefined): void {
    const currentAssets = this.rawAssets();

    const updatedAssets = currentAssets.map(asset => {
      if (asset.id === assetId) {
        return {
          ...asset,
          alertThreshold: threshold,
          isAlertTriggered: threshold !== undefined && asset.price >= threshold
        };
      }
      return asset;
    });

    this.rawAssets.set(updatedAssets);
  }

  /**
   * Actualiza las estadísticas de un activo
   */
  public updateAssetStats(assetId: string, movingAverage: number, volatility: number): void {
    const currentAssets = this.rawAssets();

    const updatedAssets = currentAssets.map(asset => {
      if (asset.id === assetId) {
        return {
          ...asset,
          movingAverage,
          volatility
        };
      }
      return asset;
    });

    this.rawAssets.set(updatedAssets);
  }

  /**
   * Obtiene un activo específico por ID
   */
  public getAssetById(assetId: string): CryptoAsset | undefined {
    return this.rawAssets().find(asset => asset.id === assetId);
  }

  /**
   * Limpia recursos cuando el servicio se destruye
   */
  ngOnDestroy(): void {
    this.pauseUpdates();
  }
}
