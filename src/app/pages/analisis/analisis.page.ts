import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonButtons, IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline, checkmarkCircleOutline, closeCircleOutline,
  timeOutline, flashOutline, pieChartOutline, trendingUpOutline,
  hardwareChipOutline, refreshOutline
} from 'ionicons/icons';

import {
  ArduinoApiService,
  AnalisisData,
} from '../../services/arduino-api.service';

@Component({
  selector: 'app-analisis',
  templateUrl: './analisis.page.html',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonButtons, IonMenuButton
  ],
})
export class AnalisisPage implements OnInit {

  datos: AnalisisData | null = null;
  cargando = true;
  error = '';

  constructor(public api: ArduinoApiService) {
    addIcons({
      analyticsOutline, checkmarkCircleOutline, closeCircleOutline,
      timeOutline, flashOutline, pieChartOutline, trendingUpOutline,
      hardwareChipOutline, refreshOutline
    });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.api.getAnalisis().subscribe({
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

  /** Total de movimientos para calcular porcentajes */
  get totalDecisionesCalc(): number {
    return this.datos?.distribucion_decisiones.reduce((acc, d) => acc + d.total, 0) ?? 0;
  }

  porcentaje(total: number): number {
    const tot = this.totalDecisionesCalc;
    if (tot === 0) return 0;
    return Math.round((total / tot) * 100);
  }

  /** Decisiones correctas estimadas por precisión acumulada */
  get decisionesCorrectas(): number {
    const m = this.datos?.modelo_ia;
    if (!m) return 0;
    return Math.round(m.total_decisiones * m.precision_acumulada / 100);
  }

  get decisionesIncorrectas(): number {
    const m = this.datos?.modelo_ia;
    if (!m) return 0;
    return m.total_decisiones - this.decisionesCorrectas;
  }

  colorDecision(decision: string): string {
    const map: Record<string, string> = {
      avanzar: 'bg-blue-500',
      girar_izquierda: 'bg-green-400',
      girar_derecha: 'bg-amber-400',
      retroceder: 'bg-red-400',
      detenerse: 'bg-gray-400',
    };
    return map[decision] ?? 'bg-purple-400';
  }

  /** Altura de la barra del gráfico: la sesión con mayor precisión = 100% */
  alturaBarraSession(pct: number | null): number {
    if (!pct) return 5;
    return Math.round(pct); // normalizado sobre 100
  }

  colorBarra(pct: number | null): string {
    if (!pct) return 'bg-blue-200';
    if (pct >= 94) return 'bg-blue-700';
    if (pct >= 90) return 'bg-blue-600';
    if (pct >= 85) return 'bg-blue-500';
    if (pct >= 80) return 'bg-blue-400';
    return 'bg-blue-300';
  }
}