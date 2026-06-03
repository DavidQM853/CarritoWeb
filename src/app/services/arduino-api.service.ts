import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ── Tipos de datos que devuelve la API ──────────────────────────────────────

export interface Dispositivo {
  id: number;
  usuario_id: number;
  nombre: string;
  mac_address: string;
  version_firmware: string;
  registrado_en: string;
  usuario_nombre: string;
}

export interface Sesion {
  id: number;
  dispositivo_id: number;
  inicio: string;
  fin: string | null;
  distancia_total_cm: number;
  decisiones_tomadas: number;
  precision_pct: number | null;
  duracion_segundos?: number;
  total_alertas?: number;
}

export interface ModeloIA {
  id: number;
  dispositivo_id: number;
  version: string;
  total_decisiones: number;
  precision_acumulada: number;
  actualizado_en: string;
}

export interface Movimiento {
  id: number;
  sesion_id: number;
  momento: string;
  sensor_izq_cm: number;
  sensor_frontal_cm: number;
  sensor_der_cm: number;
  valor_binario: number;
  decision: string;
  angulo_giro: number;
  distancia_cm: number;
  confianza_pct: number;
  tiempo_reaccion_ms: number | null;
}

export interface Alerta {
  id: number;
  sesion_id: number;
  tipo: string;
  descripcion: string;
  momento: string;
  sesion_num: number;
}

export interface DashboardData {
  dispositivo: Dispositivo;
  sesion_activa: Sesion | null;
  modelo_ia: ModeloIA;
  ultimo_movimiento: Movimiento | null;
  alertas_recientes: Alerta[];
  movimientos_recientes: Movimiento[];
  totales: {
    total_sesiones: number;
    distancia_total_cm: number;
    precision_promedio: number;
  };
  timestamp: string;
}

export interface SesionesData {
  sesion_activa: Sesion | null;
  sesiones: Sesion[];
  resumen: {
    total_sesiones: number;
    distancia_total_cm: number;
    precision_promedio: number;
    total_decisiones: number;
  };
  timestamp: string;
}

export interface AnalisisData {
  modelo_ia: ModeloIA;
  distribucion_decisiones: {
    decision: string;
    total: number;
    confianza_promedio: number;
    tiempo_reaccion_promedio: number;
  }[];
  tendencia_precision: {
    id: number;
    inicio: string;
    precision_pct: number;
    decisiones_tomadas: number;
    distancia_m: number;
  }[];
  estadisticas_reaccion: {
    promedio_ms: number;
    minimo_ms: number;
    maximo_ms: number;
  };
  total_movimientos: number;
  timestamp: string;
}

// ── Servicio ─────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class ArduinoApiService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Datos completos del Dashboard */
  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard.php`);
  }

  /** Lista de sesiones y resumen */
  getSesiones(dispositivoId = 1, limite = 20): Observable<SesionesData> {
    return this.http.get<SesionesData>(
      `${this.apiUrl}/sesiones.php?dispositivo_id=${dispositivoId}&limite=${limite}`
    );
  }

  /** Análisis del modelo IA */
  getAnalisis(dispositivoId = 1): Observable<AnalisisData> {
    return this.http.get<AnalisisData>(
      `${this.apiUrl}/analisis.php?dispositivo_id=${dispositivoId}`
    );
  }

  // ── Helpers de formato ───────────────────────────────────────────────────

  /** Convierte cm a metros con 1 decimal: 450.5 → "4.5m" */
  cmAMetros(cm: number): string {
    return (cm / 100).toFixed(1) + 'm';
  }

  /** Convierte segundos a formato "HH:MM:SS" */
  segundosADuracion(segundos: number): string {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  /** Etiqueta legible para cada tipo de decisión */
  etiquetaDecision(decision: string): string {
    const map: Record<string, string> = {
      avanzar: 'Avanzar',
      girar_izquierda: 'Girar izquierda',
      girar_derecha: 'Girar derecha',
      retroceder: 'Retroceder',
      detenerse: 'Detenerse',
    };
    return map[decision] ?? decision;
  }

  /** Formatea fecha ISO a "DD MMM YYYY HH:MM" */
  formatFecha(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric'
    }) + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  /** Tiempo relativo: "hace 2s", "hace 3 min", etc. */
  tiempoRelativo(iso: string): string {
    if (!iso) return '';
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `hace ${diff}s`;
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    return `hace ${Math.floor(diff / 3600)}h`;
  }
}
