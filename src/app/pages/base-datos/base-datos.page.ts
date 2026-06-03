import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonButtons, IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  serverOutline, gridOutline, timeOutline, bulbOutline,
  pulseOutline, warningOutline, documentTextOutline, pieChartOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-base-datos',
  templateUrl: './base-datos.page.html',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonButtons, IonMenuButton],
})
export class BaseDatosPage {
  constructor() {
    addIcons({
      serverOutline, gridOutline, timeOutline, bulbOutline,
      pulseOutline, warningOutline, documentTextOutline, pieChartOutline
    });
  }
}
