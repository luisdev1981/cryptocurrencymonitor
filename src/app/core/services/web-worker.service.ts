/**
 * Web Worker Service
 * 
 * Servicio que gestiona la comunicación con el Web Worker de estadísticas.
 * 
 * Explicación Feynman:
 * Este servicio es como un "gerente de comunicaciones" entre nosotros (la UI)
 * y nuestro asistente (el Web Worker). Le enviamos datos para calcular,
 * y él nos devuelve los resultados cuando están listos.
 * 
 * Usamos RxJS Observables para manejar las respuestas de forma reactiva,
 * como suscribirse a un canal de noticias que te avisa cuando hay actualizaciones.
 */

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { WorkerRequest, WorkerResponse, StatsResult } from '../models/stats-result.model';

@Injectable({
  providedIn: 'root'
})
export class WebWorkerService {
  private worker?: Worker;
  private statsSubject = new Subject<StatsResult>();

  /**
   * Observable que emite resultados de estadísticas
   * Los componentes pueden suscribirse a esto para recibir actualizaciones
   */
  public stats$ = this.statsSubject.asObservable();

  constructor() {
    this.initializeWorker();
  }

  /**
   * Inicializa el Web Worker
   * 
   * Explicación Feynman:
   * Es como "contratar" a nuestro asistente. Creamos una nueva instancia
   * del worker y configuramos cómo manejar sus mensajes.
   */
  private initializeWorker(): void {
    // Verificar que el navegador soporta Web Workers
    if (typeof Worker !== 'undefined') {
      try {
        // Crear el worker usando la ruta al archivo
        this.worker = new Worker(
          new URL('../workers/crypto-stats.worker', import.meta.url),
          { type: 'module' }
        );

        // Configurar el listener para mensajes del worker
        this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
          this.handleWorkerMessage(event.data);
        };

        // Manejar errores del worker
        this.worker.onerror = (error) => {
          console.error('Worker error:', error);
        };

        console.log('✅ Web Worker initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Web Worker:', error);
      }
    } else {
      console.warn('⚠️ Web Workers are not supported in this browser');
    }
  }

  /**
   * Maneja los mensajes recibidos del worker
   * 
   * @param response Respuesta del worker
   */
  private handleWorkerMessage(response: WorkerResponse): void {
    if (response.type === 'stats-result' && response.data) {
      // Emitir el resultado a través del Subject
      // Todos los componentes suscritos recibirán esta actualización
      this.statsSubject.next(response.data);
    } else if (response.type === 'error') {
      console.error('Worker calculation error:', response.error);
    } else if (response.type === 'ready') {
      console.log('✅ Worker is ready to receive messages');
    }
  }

  /**
   * Solicita cálculo de estadísticas al worker
   * 
   * Explicación Feynman:
   * Es como enviarle un email a tu asistente con los datos y pedirle
   * que calcule el promedio y la volatilidad. Él hará el trabajo
   * y te enviará la respuesta cuando termine.
   * 
   * @param assetId ID del activo
   * @param priceHistory Historial de precios
   * @param windowSize Tamaño de ventana para promedio móvil (default: 10)
   */
  public calculateStats(
    assetId: string,
    priceHistory: number[],
    windowSize: number = 10
  ): void {
    if (!this.worker) {
      console.warn('Worker not initialized, cannot calculate stats');
      return;
    }

    const request: WorkerRequest = {
      type: 'calculate-stats',
      assetId,
      priceHistory,
      windowSize
    };

    // Enviar mensaje al worker
    this.worker.postMessage(request);
  }

  /**
   * Limpia recursos cuando el servicio se destruye
   */
  public ngOnDestroy(): void {
    if (this.worker) {
      this.worker.terminate();
      console.log('🛑 Worker terminated');
    }
    this.statsSubject.complete();
  }
}
