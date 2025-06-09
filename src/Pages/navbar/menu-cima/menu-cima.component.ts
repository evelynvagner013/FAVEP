import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../Models/user.model'; // Make sure this path is correct

@Component({
  selector: 'app-menu-cima',
  standalone: true,
  imports: [CommonModule, FormsModule], // Removed LoginComponent as it's being integrated
  templateUrl: './menu-cima.component.html',
  styleUrl: './menu-cima.component.css'
})
export class MenuCimaComponent implements OnInit {
  user: any = null; // For currently logged-in user display

  // Login Modal State & Form Fields
  mostrarLoginModal = false;
  loginEmail: string = '';
  loginPassword: string = '';
  loginRememberMe: boolean = false;
  loginErrorMessage: string = '';

  // Registration Modal State & Form Fields
  mostrarRegisterModal = false;
  registerUser: User = { username: '', email: '', password: '', telefone: '', role: 'user' };
  registerSuccessMessage: string = '';
  registerErrorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.user = this.apiService.getUser(); // Get current user from AuthService
  }

  logout(): void {
    this.apiService.logout();
    window.location.reload();
  }

  // Modal Controls
  abrirLoginModal() {
    this.mostrarRegisterModal = false; // Ensure register modal is closed
    this.mostrarLoginModal = true;
    this.loginEmail = '';
    this.loginPassword = '';
    this.loginErrorMessage = '';
    this.loginRememberMe = false;
  }

  abrirRegisterModal() {
    this.mostrarLoginModal = false; // Ensure login modal is closed
    this.mostrarRegisterModal = true;
    this.registerUser = { username: '', email: '', password: '', telefone: '', role: 'user' };
    this.registerSuccessMessage = '';
    this.registerErrorMessage = '';
  }

  fecharModals() {
    this.mostrarLoginModal = false;
    this.mostrarRegisterModal = false;
  }

  // Login Form Submission
  onLoginSubmit() {
    if (this.loginEmail === "" && this.loginPassword === "") {
      this.loginErrorMessage = "Os campos precisam estar preenchidos.";
      return;
    }
    if (this.loginEmail === "") {
      this.loginErrorMessage = "O campo de email precisa estar preenchido.";
      return;
    }
    if (this.loginPassword === "") {
      this.loginErrorMessage = "O campo de senha precisa estar preenchido.";
      return;
    }

    this.apiService.login(this.loginEmail, this.loginPassword).subscribe({
      next: (response) => {
        console.log('Login realizado com sucesso!', response);
        if (response.access_token && response.user) {
          localStorage.setItem('token', response.access_token);
          this.apiService.setUser(response.user);
        }
        this.fecharModals();
        window.location.reload(); // Or navigate to a dashboard
      },
      error: (error) => {
        console.error('Erro no login', error);
        this.loginErrorMessage = 'Email ou senha inválidos';
      }
    });
  }

  // Registration Form Submission
  onRegisterSubmit() {
    console.log('Formulário de registro enviado', this.registerUser);
    if (!this.registerUser.username || !this.registerUser.email || !this.registerUser.password || !this.registerUser.telefone) {
        this.registerErrorMessage = 'Todos os campos são obrigatórios.';
        return;
    }

    this.apiService.register(this.registerUser).subscribe({
      next: (response) => {
        console.log('Usuário cadastrado com sucesso:', response);
        this.registerSuccessMessage = 'Cadastro realizado com sucesso! Você já pode logar.';
        this.registerErrorMessage = '';
        // Clear form or automatically switch to login
        setTimeout(() => {
          this.abrirLoginModal(); // Switch to login modal after showing success
          this.registerSuccessMessage = ''; // Clear message after switch
        }, 2500);
      },
      error: (error) => {
        console.error('Erro no cadastro', error);
        this.registerErrorMessage = 'Erro ao cadastrar. Verifique os dados. ' + (error.error?.message || '');
        this.registerSuccessMessage = '';
      }
    });
  }
}