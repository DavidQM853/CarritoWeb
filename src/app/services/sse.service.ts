import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardData, Movimiento, Alerta } from './arduino-api.service';

/**
 * Estado de la conexión SSE.
 */
export type SseConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

/**
 * Servicio que gestiona la conexión Server-Sent Events (SSE)
 * para recibir datos en tiempo real desde el backend PHP.
 *
 * Uso:
 *   - Inyectar en el componente
 *   - Llamar connect() para iniciar la conexión
 *   - Suscribirse a dashboardData$ para recibir actualizaciones
 *   - Llamar disconnect() o dejar que OnDestroy lo haga
 */
@Injectable({
  providedIn: 'root'
})
export class SseService implements OnDestroy {

  private eventSource: EventSource | null = null;
  private sseUrl = `${environment.apiUrl}/sse.php`;

  // ── Subjects internos ────────────────────────────────────────────────────
  private dashboardSubject = new Subject<DashboardData>();
  private movimientoSubject = new Subject<Movimiento>();
  private alertaSubject = new Subject<Alerta>();
  private connectionStateSubject = new BehaviorSubject<SseConnectionState>('disconnected');

  // ── Observables públicos ─────────────────────────────────────────────────
  /** Emite cada vez que el servidor envía datos actualizados del dashboard */
  dashboardData$: Observable<DashboardData> = this.dashboardSubject.asObservable();

  /** Emite cuando se detecta un nuevo movimiento */
  movimiento$: Observable<Movimiento> = this.movimientoSubject.asObservable();

  /** Emite cuando se detecta una nueva alerta */
  alerta$: Observable<Alerta> = this.alertaSubject.asObservable();

  /** Estado actual de la conexión SSE */
  connectionState$: Observable<SseConnectionState> = this.connectionStateSubject.asObservable();

  // ── Reconexión ───────────────────────────────────────────────────────────
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: any = null;

  constructor(private zone: NgZone) {}

  /**
   * Inicia la conexión SSE con el servidor.
   * Si ya existe una conexión, la cierra primero.
   */
  connect(dispositivoId: number = 1): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.createConnection(dispositivoId);
  }

  /**
   * Cierra la conexión SSE y limpia recursos.
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.connectionStateSubject.next('disconnected');
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.dashboardSubject.complete();
    this.movimientoSubject.complete();
    this.alertaSubject.complete();
    this.connectionStateSubject.complete();
  }

  // ── Internals ────────────────────────────────────────────────────────────

  private createConnection(dispositivoId: number): void {
    const url = `${this.sseUrl}?dispositivo_id=${dispositivoId}`;
    this.connectionStateSubject.next('connecting');

    try {
      this.eventSource = new EventSource(url);

      // ── Conexión abierta ─────────────────────────────────────────────
      this.eventSource.onopen = () => {
        this.zone.run(() => {
          this.connectionStateSubject.next('connected');
          this.reconnectAttempts = 0;
        });
      };

      // ── Evento: dashboard_update ─────────────────────────────────────
      this.eventSource.addEventListener('dashboard_update', (event: MessageEvent) => {
        this.zone.run(() => {
          try {
            const data: DashboardData = JSON.parse(event.data);
            this.dashboardSubject.next(data);
          } catch (e) {
            console.error('[SSE] Error parseando dashboard_update:', e);
          }
        });
      });

      // ── Evento: movimiento ───────────────────────────────────────────
      this.eventSource.addEventListener('movimiento', (event: MessageEvent) => {
        this.zone.run(() => {
          try {
            const data: Movimiento = JSON.parse(event.data);
            this.movimientoSubject.next(data);
          } catch (e) {
            console.error('[SSE] Error parseando movimiento:', e);
          }
        });
      });

      // ── Evento: alerta ───────────────────────────────────────────────
      this.eventSource.addEventListener('alerta', (event: MessageEvent) => {
        this.zone.run(() => {
          try {
            const data: Alerta = JSON.parse(event.data);
            this.alertaSubject.next(data);
          } catch (e) {
            console.error('[SSE] Error parseando alerta:', e);
          }
        });
      });

      // ── Evento: heartbeat (solo para mantener viva la conexión) ──────
      this.eventSource.addEventListener('heartbeat', () => {
        // No necesitamos hacer nada, solo mantiene la conexión viva
      });

      // ── Error / desconexión ──────────────────────────────────────────
      this.eventSource.onerror = () => {
        this.zone.run(() => {
          if (this.eventSource?.readyState === EventSource.CLOSED) {
            this.connectionStateSubject.next('disconnected');
            this.attemptReconnect(dispositivoId);
          } else {
            this.connectionStateSubject.next('reconnecting');
          }
        });
      };

    } catch (e) {
      console.error('[SSE] Error creando EventSource:', e);
      this.connectionStateSubject.next('disconnected');
      this.attemptReconnect(dispositivoId);
    }
  }

  /**
   * Reconexión con backoff exponencial.
   * Espera: 1s, 2s, 4s, 8s, 16s, 30s (máx)
   */
  private attemptReconnect(dispositivoId: number): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[SSE] Máximo de intentos de reconexión alcanzado.');
      this.connectionStateSubject.next('disconnected');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);

    console.log(`[SSE] Reconectando en ${delay / 1000}s (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    this.connectionStateSubject.next('reconnecting');

    this.reconnectTimer = setTimeout(() => {
      this.createConnection(dispositivoId);
    }, delay);
  }
}
