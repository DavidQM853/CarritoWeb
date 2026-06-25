import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import {
  IonApp, IonRouterOutlet, IonSplitPane, IonMenu,
  IonContent, IonList, IonItem, IonIcon, IonLabel,
  IonMenuToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { CommonModule } from '@angular/common';
import {
  gridOutline, analyticsOutline, timeOutline,
  readerOutline, serverOutline, cogOutline, hardwareChipOutline,
  logOutOutline
} from 'ionicons/icons';
import { filter } from 'rxjs/operators';

import { AuthService } from './services/auth.service';

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

  /** Ocultar sidebar en la página de login */
  showSidebar = true;

  constructor(
    private router: Router,
    public auth: AuthService
  ) {
    addIcons({
      gridOutline, analyticsOutline, timeOutline,
      readerOutline, serverOutline, cogOutline, hardwareChipOutline,
      logOutOutline
    });

    // Detectar si estamos en /login para ocultar el sidebar
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.showSidebar = !e.urlAfterRedirects.startsWith('/login');
      });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}