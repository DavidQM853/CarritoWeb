import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonButtons, IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  readerOutline, navigateOutline, arrowForwardOutline,
  warningOutline, refreshOutline, bulbOutline,
  wifiOutline, statsChartOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-log-eventos',
  templateUrl: './log-eventos.page.html',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonButtons, IonMenuButton],
})
export class LogEventosPage {
  constructor() {
    addIcons({
      readerOutline, navigateOutline, arrowForwardOutline,
      warningOutline, refreshOutline, bulbOutline,
      wifiOutline, statsChartOutline
    });
  }
}
