import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  usuarioCorreo: string = '';
  contrasena: string = '';
  mensajeError: string = '';
  mostrarPerfil: boolean = false;
  usuarioId: number | null = null;
  nombreUsuario: string = '';
  perfilExiste: boolean = false;

  nombre: string = '';
  apellido: string = '';
  edad: string = '';
  correo: string = '';
  telefono: string = '';
  mensajePerfil: string = '';

  constructor(private cdr: ChangeDetectorRef) {}

  async login() {
    this.mensajeError = '';
    this.cdr.detectChanges();

    const data = {
      usuarioCorreo: this.usuarioCorreo,
      contrasena: this.contrasena
    };

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const resultado = await response.json();

      if (!response.ok) {
        this.mensajeError = resultado.message || 'No se pudo iniciar sesión';
        this.cdr.detectChanges();
        return;
      }

      this.usuarioId = resultado.usuario.id;
      this.nombreUsuario = resultado.usuario.usuario;
      this.mostrarPerfil = true;
      this.mensajePerfil = '';
      this.cdr.detectChanges();

      await this.cargarPerfil();

      console.log('Login exitoso:', resultado);
    } catch (error) {
      this.mensajeError = 'Error de conexión con el servidor';
      this.cdr.detectChanges();
      console.error(error);
    }
  }

  async cargarPerfil() {
  try {
    const response = await fetch(`http://localhost:3000/perfil/${this.usuarioId}`);

    const data = await response.json();

    console.log("Perfil recibido:", data);

    if (!response.ok || !data || Object.keys(data).length === 0) {
      this.perfilExiste = false;

      this.nombre = '';
      this.apellido = '';
      this.edad = '';
      this.correo = '';
      this.telefono = '';

      this.cdr.detectChanges();
      return;
    }

    this.perfilExiste = true;

    this.nombre = data.nombre ?? '';
    this.apellido = data.apellido ?? '';
    this.edad = data.edad?.toString() ?? '';
    this.correo = data.correo ?? '';
    this.telefono = data.telefono ?? '';

    this.cdr.detectChanges();

  } catch (error) {
    this.perfilExiste = false;
    this.cdr.detectChanges();
    console.error(error);
  }
}

  async guardarPerfil() {
    this.mensajePerfil = '';
    this.cdr.detectChanges();

    const data = {
      usuario_id: this.usuarioId,
      nombre: this.nombre,
      apellido: this.apellido,
      edad: this.edad,
      correo: this.correo,
      telefono: this.telefono
    };

    try {
      let response: Response;

      if (this.perfilExiste) {
        response = await fetch(`http://localhost:3000/perfil/${this.usuarioId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre: this.nombre,
            apellido: this.apellido,
            edad: this.edad,
            correo: this.correo,
            telefono: this.telefono
          })
        });
      } else {
        response = await fetch('http://localhost:3000/perfil', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      }

      const resultado = await response.json();

      if (!response.ok) {
        this.mensajePerfil = resultado.message || 'Error al guardar el perfil';
        this.cdr.detectChanges();
        return;
      }

      this.mensajePerfil = this.perfilExiste
        ? 'Perfil actualizado de manera correcta'
        : 'Perfil guardado de manera correcta';

      this.perfilExiste = true;
      this.cdr.detectChanges();

      console.log('Resultado perfil:', resultado);
    } catch (error) {
      this.mensajePerfil = 'Error de conexión con el servidor';
      this.cdr.detectChanges();
      console.error(error);
    }
  }

  cerrarSesion() {
    this.mostrarPerfil = false;
    this.usuarioCorreo = '';
    this.contrasena = '';
    this.mensajeError = '';
    this.mensajePerfil = '';
    this.usuarioId = null;
    this.nombreUsuario = '';
    this.perfilExiste = false;

    this.nombre = '';
    this.apellido = '';
    this.edad = '';
    this.correo = '';
    this.telefono = '';

    this.cdr.detectChanges();
  }
}