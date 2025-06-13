// Imports...
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../Models/user.model';

@Component({
  // ... selector, standalone, etc.
  selector: 'app-menu-cima',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-cima.component.html',
  styleUrl: './menu-cima.component.css'
})
export class MenuCimaComponent implements OnInit {
  // ... (outras propriedades permanecem as mesmas) ...
  user: any = null;
  mostrarLoginModal = false;
  loginEmail: string = '';
  loginPassword: string = '';
  loginRememberMe: boolean = false;
  loginErrorMessage: string = '';
  mostrarRegisterModal = false;
  registerUser: any = { username: '', email: '', password: '', telefone: '', confirmarSenha: '' }; // Adicionado confirmarSenha
  registerSuccessMessage: string = '';
  registerErrorMessage: string = '';


  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.user = this.apiService.getUser();
  }

  logout(): void {
    this.apiService.logout();
    this.router.navigate(['/home']).then(() => window.location.reload());
  }

  // ... (abrir/fechar modais permanecem os mesmos) ...
  abrirLoginModal() {
    this.mostrarRegisterModal = false;
    this.mostrarLoginModal = true;
    this.loginEmail = '';
    this.loginPassword = '';
    this.loginErrorMessage = '';
    this.loginRememberMe = false;
  }

  abrirRegisterModal() {
    this.mostrarLoginModal = false;
    this.mostrarRegisterModal = true;
    this.registerUser = { username: '', email: '', password: '', telefone: '', confirmarSenha: '' };
    this.registerSuccessMessage = '';
    this.registerErrorMessage = '';
  }

  fecharModals() {
    this.mostrarLoginModal = false;
    this.mostrarRegisterModal = false;
  }


  onLoginSubmit() {
    if (!this.loginEmail || !this.loginPassword) {
      this.loginErrorMessage = "Email e senha são obrigatórios.";
      return;
    }

    this.apiService.login(this.loginEmail, this.loginPassword).subscribe({
      next: (response) => {
        console.log('Login realizado com sucesso!', response);
        // ✅ CORRIGIDO: O backend retorna 'token' e 'user'
        if (response.token && response.user) {
          localStorage.setItem('token', response.token);
          this.apiService.setUser(response.user);
        }
        this.fecharModals();
        // Redireciona para a página de gerenciamento após o login
        this.router.navigate(['/gerenciamento']);
      },
      error: (error) => {
        console.error('Erro no login', error);
        // ✅ CORRIGIDO: Exibe a mensagem de erro vinda do backend
        this.loginErrorMessage = error.error?.error || 'Email ou senha inválidos';
      }
    });
  }

  onRegisterSubmit() {
    // Validação simples
    if (!this.registerUser.username || !this.registerUser.email || !this.registerUser.password || !this.registerUser.telefone) {
        this.registerErrorMessage = 'Todos os campos são obrigatórios.';
        return;
    }

    // ✅ CORRIGIDO: Mapeia os campos do formulário para o formato que o back-end espera.
    const payload = {
      nome: this.registerUser.username,
      email: this.registerUser.email,
      telefone: this.registerUser.telefone,
      senha: this.registerUser.password,
      confirmarSenha: this.registerUser.password // O back-end espera a confirmação
    };

    this.apiService.register(payload).subscribe({
      next: (response) => {
        console.log('Usuário cadastrado com sucesso:', response);
        this.registerSuccessMessage = 'Cadastro realizado com sucesso! Faça o login para continuar.';
        this.registerErrorMessage = '';
        setTimeout(() => {
          this.abrirLoginModal();
        }, 2500);
      },
      error: (error) => {
        console.error('Erro no cadastro', error);
        // ✅ CORRIGIDO: Exibe a mensagem de erro vinda do backend
        this.registerErrorMessage = error.error?.error || 'Erro ao cadastrar. Verifique os dados.';
        this.registerSuccessMessage = '';
      }
    });
  }
}
