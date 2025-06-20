import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs'; // Adicionado para o tema
import { ThemeService } from '../../../services/theme.service'; // Adicionado para o tema

@Component({
  selector: 'app-menu-cima',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-cima.component.html',
  styleUrl: './menu-cima.component.css'
})
export class MenuCimaComponent implements OnInit {
  // --- LÓGICA DE TEMA ---
  public isDarkMode$: Observable<boolean>;

  // --- Propriedades para o estado do usuário e controle dos modais ---
  user: any = null;
  mostrarLoginModal = false;
  mostrarRegisterModal = false;

  // --- Propriedades para o formulário de Login ---
  loginEmail: string = '';
  loginPassword: string = '';
  loginRememberMe: boolean = false;
  loginErrorMessage: string = '';

  // --- Propriedades para o formulário de Registro ---
  registerUser: any = { username: '', email: '', password: '', telefone: '', confirmarSenha: '' };
  registerSuccessMessage: string = '';
  registerErrorMessage: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private themeService: ThemeService // Injetando o serviço de tema
  ) {
    // Inicializando o observable do tema
    this.isDarkMode$ = this.themeService.isDarkMode$;
  }

  ngOnInit(): void {
    // Ao iniciar o componente, verifica se há um usuário logado no serviço
    this.user = this.apiService.getUser();
  }

  // --- LÓGICA DE TEMA ---
  /**
   * Chamado quando o switch de tema é acionado, e pede ao serviço para alternar o tema.
   */
  onThemeToggle(): void {
    this.themeService.toggleTheme();
  }

  // --- LÓGICA DE AUTENTICAÇÃO E MODAIS (EXISTENTE) ---
  logout(): void {
    // Realiza o logout, limpa os dados e recarrega a página
    this.apiService.logout();
    this.router.navigate(['/home']).then(() => window.location.reload());
  }

  // --- Métodos para controle dos Modais ---

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

  // --- Métodos de Submissão dos Formulários ---

  onLoginSubmit() {
    if (!this.loginEmail || !this.loginPassword) {
      this.loginErrorMessage = "Email e senha são obrigatórios.";
      return;
    }

    this.apiService.login(this.loginEmail, this.loginPassword).subscribe({
      next: (response) => {
        console.log('Login realizado com sucesso!', response);
        if (response.token && response.user) {
          localStorage.setItem('token', response.token);
          this.apiService.setUser(response.user);
          this.user = response.user; // Atualiza o usuário no componente
        }
        this.fecharModals();
        // Redireciona para a página de gerenciamento ou recarrega a página atual
        this.router.navigate(['/gerenciamento']);
      },
      error: (error) => {
        console.error('Erro no login', error);
        this.loginErrorMessage = error.error?.error || 'Email ou senha inválidos';
      }
    });
  }

  onRegisterSubmit() {
    if (!this.registerUser.username || !this.registerUser.email || !this.registerUser.password || !this.registerUser.telefone || !this.registerUser.confirmarSenha) {
        this.registerErrorMessage = 'Todos os campos são obrigatórios.';
        this.registerSuccessMessage = '';
        return;
    }

    if (this.registerUser.password !== this.registerUser.confirmarSenha) {
        this.registerErrorMessage = 'As senhas não coincidem.';
        this.registerSuccessMessage = '';
        return;
    }

    this.registerErrorMessage = '';

    const payload = {
      nome: this.registerUser.username,
      email: this.registerUser.email,
      telefone: this.registerUser.telefone,
      senha: this.registerUser.password,
      confirmarSenha: this.registerUser.confirmarSenha
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
        this.registerErrorMessage = error.error?.error || 'Erro ao cadastrar. Verifique os dados.';
        this.registerSuccessMessage = '';
      }
    });
  }
}