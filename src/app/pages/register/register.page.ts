import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  hardwareChipOutline, personOutline, mailOutline, lockClosedOutline,
  eyeOutline, eyeOffOutline, personAddOutline, checkmarkCircleOutline
} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonSpinner],
})
export class RegisterPage {
  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;
  loading = false;
  error = '';
  success = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    addIcons({
      hardwareChipOutline, personOutline, mailOutline, lockClosedOutline,
      eyeOutline, eyeOffOutline, personAddOutline, checkmarkCircleOutline
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirm(): void {
    this.showConfirm = !this.showConfirm;
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';

    // Validaciones
    if (!this.nombre.trim() || !this.email.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
      this.error = 'Por favor completa todos los campos.';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;

    this.auth.register(this.nombre, this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.success = '¡Cuenta creada exitosamente! Redirigiendo al login...';
          this.error = '';
          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 2000);
        } else {
          this.error = res.message || 'No se pudo crear la cuenta.';
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.error = 'Ya existe una cuenta con ese email.';
        } else if (err.status === 400) {
          this.error = err.error?.message || 'Datos inválidos. Revisa los campos.';
        } else if (err.status === 0) {
          this.error = 'No se pudo conectar al servidor. ¿Está XAMPP corriendo?';
        } else {
          this.error = 'Error del servidor. Intenta de nuevo.';
        }
      }
    });
  }
}
