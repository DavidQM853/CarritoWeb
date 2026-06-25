import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  hardwareChipOutline, mailOutline, lockClosedOutline,
  eyeOutline, eyeOffOutline, logInOutline
} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonSpinner],
})
export class LoginPage {
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    addIcons({
      hardwareChipOutline, mailOutline, lockClosedOutline,
      eyeOutline, eyeOffOutline, logInOutline
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToRegister(): void {
    this.router.navigateByUrl('/register');
  }

  onSubmit(): void {
    // Validación básica
    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'Por favor completa todos los campos.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.router.navigateByUrl('/dashboard');
        } else {
          this.error = res.message || 'Credenciales incorrectas.';
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.error = 'Email o contraseña incorrectos.';
        } else if (err.status === 0) {
          this.error = 'No se pudo conectar al servidor. ¿Está XAMPP corriendo?';
        } else {
          this.error = 'Error del servidor. Intenta de nuevo.';
        }
      }
    });
  }
}
