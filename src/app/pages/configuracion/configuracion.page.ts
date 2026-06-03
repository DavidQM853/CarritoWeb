import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonButtons, IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  hardwareChipOutline, pulseOutline, radioOutline, bulbOutline,
  serverOutline, notificationsOutline, buildOutline, refreshOutline,
  downloadOutline, trashOutline, chevronForwardOutline, informationCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonButtons, IonMenuButton],
})
export class ConfiguracionPage {
  constructor() {
    addIcons({
      hardwareChipOutline, pulseOutline, radioOutline, bulbOutline,
      serverOutline, notificationsOutline, buildOutline, refreshOutline,
      downloadOutline, trashOutline, chevronForwardOutline, informationCircleOutline
    });
  }
}
