import { Component, OnInit } from '@angular/core';
import { LoginComponent } from '../../Auth/login/login.component';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu-cima',
  standalone: true,
  imports: [LoginComponent, CommonModule, FormsModule,],
  templateUrl: './menu-cima.component.html',
  styleUrl: './menu-cima.component.css'
})
export class MenuCimaComponent implements OnInit {
  user: any = null;

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.user = this.apiService.getUser(); // Pega o usuário do AuthService
  }

  logout(): void {
    this.apiService.logout();
    window.location.reload();
  }

  mostrarForm = false;

  rememberMe: boolean = false;

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  mostrarFormulario() {
    this.mostrarForm = true;
    this.email = '';
    this.password = '';
    this.errorMessage = '';
    this.rememberMe = false;
  }

  fecharFormulario() {
    this.mostrarForm = false;
  }

  onSubmit() {
    if(this.email == "" && this.password == ""){
      this.errorMessage = "Os campos precisam estarem preenchidos."
      return;
    }
    else if(this.email == ""){
      this.errorMessage = "O campo de email precisa estar preenchido."
      return;
    }
    else if(this.password == ""){
      this.errorMessage = "O campo de senha precisa estar preenchido."
      return;
    }

    this.apiService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login realizado com sucesso!', response);
        if (response.access_token && response.user) {
          localStorage.setItem('token', response.access_token);
          this.apiService.setUser(response.user);
        }
        window.location.reload();
      },
      error: (error) => {
        console.error('Erro no login', error);
        this.errorMessage = 'Email ou senha inválidos';
      }
    });
  }
}
