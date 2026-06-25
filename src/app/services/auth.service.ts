import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export interface LoginResponse {
  success: boolean;
  usuario?: Usuario;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  usuario?: Usuario;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;
  private readonly STORAGE_KEY = 'arduino_ia_user';

  /** Observable del usuario activo (null = no logueado) */
  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.getStoredUser());
  usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Retorna true si hay usuario en sesión */
  get isLoggedIn(): boolean {
    return this.usuarioSubject.value !== null;
  }

  /** Retorna el usuario actual */
  get currentUser(): Usuario | null {
    return this.usuarioSubject.value;
  }

  /** Realiza login contra la API */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login.php`, { email, password })
      .pipe(
        tap(res => {
          if (res.success && res.usuario) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(res.usuario));
            this.usuarioSubject.next(res.usuario);
          }
        })
      );
  }

  /** Registra un nuevo usuario */
  register(nombre: string, email: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register.php`, { nombre, email, password });
  }

  /** Cierra sesión */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.usuarioSubject.next(null);
  }

  /** Recupera usuario de localStorage */
  private getStoredUser(): Usuario | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
