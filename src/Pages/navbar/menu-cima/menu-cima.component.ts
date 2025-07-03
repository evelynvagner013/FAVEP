import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-menu-cima',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-cima.component.html',
  styleUrl: './menu-cima.component.css'
})
export class MenuCimaComponent implements OnInit {
  // Propriedades para o estado do usuário e controle dos modais
  user: any = null;
  mostrarLoginModal = false;
  mostrarRegisterModal = false;

  // Propriedade para a mensagem do cabeçalho do modal de login
  loginHeaderMessage: string | null = null;

  // Propriedades para o formulário de Login
  loginEmail: string = '';
  loginPassword: string = '';
  loginRememberMe: boolean = false;
  loginErrorMessage: string = '';

  // Propriedades para o formulário de Registro
  registerUser: any = { username: '', email: '', password: '', telefone: '', confirmarSenha: '' };
  registerSuccessMessage: string = '';
  registerErrorMessage: string = '';

  currentTheme: string = 'light-theme'; // Tema padrão

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.user = this.apiService.getUser();
    this.route.queryParams.subscribe(params => {
      if (params['openLogin'] === 'true') {
        if (params['reason'] === 'unauthorized') {
          this.loginHeaderMessage = 'Para acessar essa área é necessário entrar com uma conta com um plano ativo.';
        }
        
        this.mostrarLoginModal = true; // Abre o modal diretamente
        
        // Limpa os parâmetros da URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { openLogin: null, reason: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });
  }

  logout(): void {
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
    this.loginHeaderMessage = null; 
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
    this.loginHeaderMessage = null;
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
          this.user = response.user;
        }
        this.fecharModals();
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
