import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp, IonRouterOutlet, IonSplitPane, IonMenu,
  IonContent, IonList, IonItem, IonIcon, IonLabel,
  IonMenuToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { CommonModule } from '@angular/common';
import {
  gridOutline, analyticsOutline, timeOutline,
  readerOutline, serverOutline, cogOutline, hardwareChipOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive,
    IonApp, IonRouterOutlet, IonSplitPane, IonMenu,
    IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle
  ],
})
export class AppComponent {
  pages = [
    { title: 'Dashboard', url: '/dashboard', icon: 'grid-outline' },
    { title: 'Análisis', url: '/analisis', icon: 'analytics-outline' },
    { title: 'Sesiones', url: '/sesiones', icon: 'time-outline' },
    { title: 'Log de eventos', url: '/log-eventos', icon: 'reader-outline' },
    { title: 'Base de datos', url: '/base-datos', icon: 'server-outline' },
    { title: 'Configuración', url: '/configuracion', icon: 'cog-outline' },
  ];

  constructor() {
    addIcons({
      gridOutline, analyticsOutline, timeOutline,
      readerOutline, serverOutline, cogOutline, hardwareChipOutline
    });
  }
}