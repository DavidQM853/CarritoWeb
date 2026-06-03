import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonButtons, IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, radioOutline, refreshOutline } from 'ionicons/icons';

import {
  ArduinoApiService,
  SesionesData,
  Sesion
} from '../../services/arduino-api.service';

@Component({
  selector: 'app-sesiones',
  templateUrl: './sesiones.page.html',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonButtons, IonMenuButton
  ],
})
export class SesionesPage implements OnInit {

  datos: SesionesData | null = null;
  cargando = true;
  error = '';

  constructor(public api: ArduinoApiService) {
    addIcons({ timeOutline, radioOutline, refreshOutline });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.api.getSesiones().subscribe({
      next: (datos) => {
        this.datos = datos;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo conectar a la API. ¿Está XAMPP corriendo?';
        this.cargando = false;
      }
    });
  }

  /** Sesiones históricas (excluyendo la sesión activa) */
  get sesionesHistoricas(): Sesion[] {
    if (!this.datos) return [];
    const activaId = this.datos.sesion_activa?.id;
    return this.datos.sesiones.filter(s => s.id !== activaId);
  }

  estadoSesion(sesion: Sesion): { texto: string; clase: string } {
    if (!sesion.fin) {
      return { texto: 'En curso', clase: 'bg-green-100 text-green-700' };
    }
    const pct = sesion.precision_pct ?? 0;
    if (pct >= 90) return { texto: 'completada', clase: 'bg-gray-100 text-gray-500' };
    if (pct >= 80) return { texto: 'alerta', clase: 'bg-amber-100 text-amber-600' };
    return { texto: 'completada', clase: 'bg-gray-100 text-gray-500' };
  }

  colorPrecision(pct: number | null): string {
    if (!pct) return 'text-gray-700';
    if (pct >= 90) return 'text-green-600';
    if (pct >= 80) return 'text-amber-600';
    return 'text-red-500';
  }

  duracionSesion(sesion: Sesion): string {
    const seg = sesion.duracion_segundos ?? 0;
    return this.api.segundosADuracion(seg);
  }

  fechaSesion(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  horaSesion(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}