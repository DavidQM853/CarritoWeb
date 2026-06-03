import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  hardwareChipOutline, radioOutline, timeOutline, navigateOutline,
  pulseOutline, bulbOutline, listOutline, desktopOutline, refreshOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';

import {
  ArduinoApiService,
  DashboardData,
} from '../../services/arduino-api.service';
import { SseService, SseConnectionState } from '../../services/sse.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonContent, IonIcon],
})
export class DashboardPage implements OnInit, OnDestroy {

  datos: DashboardData | null = null;
  cargando = true;
  error = '';
  ultimaActualizacion = '';

  /** Estado de la conexión SSE para mostrar en la UI */
  connectionState: SseConnectionState = 'disconnected';

  private sseSub?: Subscription;
  private connSub?: Subscription;

  constructor(
    public api: ArduinoApiService,
    private sse: SseService
  ) {
    addIcons({
      hardwareChipOutline, radioOutline, timeOutline, navigateOutline,
      pulseOutline, bulbOutline, listOutline, desktopOutline, refreshOutline
    });
  }

  ngOnInit(): void {
    // 1. Carga inicial via HTTP (rápida, una sola vez)
    this.cargar();

    // 2. Conectar SSE para recibir actualizaciones en tiempo real
    this.sse.connect(1);

    // 3. Suscribirse al stream de datos del dashboard
    this.sseSub = this.sse.dashboardData$.subscribe({
      next: (datos) => {
        this.datos = datos;
        this.ultimaActualizacion = 'ahora';
        this.cargando = false;
        this.error = '';
      },
      error: (err) => {
        console.error('[Dashboard] Error en stream SSE:', err);
      }
    });

    // 4. Suscribirse al estado de conexión
    this.connSub = this.sse.connectionState$.subscribe({
      next: (state) => {
        this.connectionState = state;
      }
    });
  }

  ngOnDestroy(): void {
    this.sseSub?.unsubscribe();
    this.connSub?.unsubscribe();
    this.sse.disconnect();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.api.getDashboard().subscribe({
      next: (datos) => {
        this.datos = datos;
        this.cargando = false;
        this.ultimaActualizacion = 'ahora';
      },
      error: (err) => {
        this.error = 'No se pudo conectar a la API. ¿Está XAMPP corriendo?';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  // ── Helpers para el estado de conexión ─────────────────────────────────

  get connectionLabel(): string {
    const labels: Record<SseConnectionState, string> = {
      connecting: 'Conectando…',
      connected: 'En vivo',
      reconnecting: 'Reconectando…',
      disconnected: 'Desconectado',
    };
    return labels[this.connectionState];
  }

  get connectionBadgeClass(): string {
    const classes: Record<SseConnectionState, string> = {
      connecting: 'bg-amber-100 text-amber-700',
      connected: 'bg-green-100 text-green-700',
      reconnecting: 'bg-amber-100 text-amber-700',
      disconnected: 'bg-red-100 text-red-600',
    };
    return classes[this.connectionState];
  }

  get connectionDotClass(): string {
    const classes: Record<SseConnectionState, string> = {
      connecting: 'bg-amber-500 animate-pulse',
      connected: 'bg-green-500 animate-pulse',
      reconnecting: 'bg-amber-500 animate-pulse',
      disconnected: 'bg-red-500',
    };
    return classes[this.connectionState];
  }

  // ── Helpers de datos ──────────────────────────────────────────────────

  get distanciaFrontal(): string {
    const m = this.datos?.ultimo_movimiento;
    if (!m) return '—';
    return this.api.cmAMetros(m.sensor_frontal_cm);
  }

  get precision(): string {
    const p = this.datos?.modelo_ia?.precision_acumulada;
    return p != null ? p.toFixed(1) + '%' : '—';
  }

  get tiempoReaccion(): string {
    const m = this.datos?.ultimo_movimiento;
    if (!m?.tiempo_reaccion_ms) return '—';
    return m.tiempo_reaccion_ms + 'ms';
  }

  get decisiones(): number {
    return this.datos?.sesion_activa?.decisiones_tomadas ?? 0;
  }

  get sensorFrontalPct(): number {
    const m = this.datos?.ultimo_movimiento;
    if (!m) return 0;
    // Max sensor = 400cm, invertido (más cerca = barra más llena)
    return Math.min(100, Math.round((400 - m.sensor_frontal_cm) / 4));
  }

  get sensorIzqPct(): number {
    const m = this.datos?.ultimo_movimiento;
    if (!m) return 0;
    return Math.min(100, Math.round((400 - m.sensor_izq_cm) / 4));
  }

  get sensorDerPct(): number {
    const m = this.datos?.ultimo_movimiento;
    if (!m) return 0;
    return Math.min(100, Math.round((400 - m.sensor_der_cm) / 4));
  }

  get sensorFrontalColor(): string {
    const pct = this.sensorFrontalPct;
    return pct > 70 ? 'bg-red-400' : pct > 40 ? 'bg-amber-400' : 'bg-green-400';
  }

  get etiquetaUltimaDecision(): string {
    const m = this.datos?.ultimo_movimiento;
    if (!m) return '—';
    return this.api.etiquetaDecision(m.decision);
  }

  colorEvento(tipo: string): string {
    const map: Record<string, string> = {
      movimiento: 'bg-blue-400',
      avanzar: 'bg-green-400',
      colision_evitada: 'bg-red-400',
      modelo_actualizado: 'bg-amber-400',
      bateria_baja: 'bg-amber-400',
    };
    return map[tipo] ?? 'bg-gray-400';
  }

  badgeEvento(tipo: string): string {
    const map: Record<string, string> = {
      colision_evitada: 'bg-red-100 text-red-600',
      bateria_baja: 'bg-amber-100 text-amber-700',
      modelo_actualizado: 'bg-amber-100 text-amber-700',
      señal_debil: 'bg-amber-100 text-amber-700',
    };
    return map[tipo] ?? 'bg-blue-100 text-blue-600';
  }

  etiquetaAlerta(tipo: string): string {
    const map: Record<string, string> = {
      colision_evitada: 'alerta',
      bateria_baja: 'batería',
      modelo_actualizado: 'sistema',
      señal_debil: 'señal',
      error_sensor: 'sensor',
      otro: 'otro',
    };
    return map[tipo] ?? tipo;
  }
}
