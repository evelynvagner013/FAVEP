import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- Imports Corrigidos ---
import { AuthService } from '../../../services/auth.service';
import { Usuario } from '../../../models/api.models';


@Component({
  selector: 'app-menu-cima',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Adicionado RouterLink
  templateUrl: './menu-cima.component.html',
  styleUrl: './menu-cima.component.css'
})
export class MenuCimaComponent implements OnInit {
  // Propriedades para o estado do usuário e controle dos modais
  user: Usuario | null = null;
  mostrarLoginModal = false;
  mostrarRegisterModal = false;
  loginHeaderMessage: string | null = null;

  // Propriedades para os formulários
  loginEmail: string = '';
  loginPassword: string = '';
  loginErrorMessage: string = '';
  registerUser: any = { username: '', email: '', password: '', telefone: '', confirmarSenha: '' };
  registerSuccessMessage: string = '';
  registerErrorMessage: string = '';

  // --- Construtor Corrigido ---
  constructor(
    private authService: AuthService, // Usa o serviço correto
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Escuta as mudanças no usuário logado em tempo real
    this.authService.currentUser.subscribe(user => {
      this.user = user;
    });

    // A lógica para abrir o modal via URL permanece a mesma
    this.route.queryParams.subscribe(params => {
      if (params['openLogin'] === 'true') {
        if (params['reason'] === 'unauthorized') {
          this.loginHeaderMessage = 'Para acessar essa área é necessário entrar com uma conta.';
        }
        this.mostrarLoginModal = true;
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
    this.authService.logout();
    this.router.navigate(['/home']); // Remove o reload da página
  }

  // --- Métodos de Submissão Corrigidos ---

  onLoginSubmit() {
    if (!this.loginEmail || !this.loginPassword) {
      this.loginErrorMessage = "Email e senha são obrigatórios.";
      return;
    }

    // Chama o login do AuthService
    this.authService.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => {
        // A lógica de salvar token/usuário já está no serviço!
        console.log('Login realizado com sucesso!');
        this.fecharModals();
        this.router.navigate(['/gerenciamento']); // Redireciona após o login
      },
      error: (error) => {
        console.error('Erro no login', error);
        this.loginErrorMessage = error.error?.error || 'Email ou senha inválidos';
      }
    });
  }

  onRegisterSubmit() {
    if (this.registerUser.password !== this.registerUser.confirmarSenha) {
      this.registerErrorMessage = 'As senhas não coincidem.';
      return;
    }
    // Lógica de validação...

    const payload = {
      nome: this.registerUser.username,
      email: this.registerUser.email,
      telefone: this.registerUser.telefone,
      senha: this.registerUser.password,
    };

    // Chama o registro do AuthService
    this.authService.register(payload).subscribe({
      next: () => {
        this.registerSuccessMessage = 'Cadastro realizado com sucesso! Faça o login para continuar.';
        this.registerErrorMessage = '';
        setTimeout(() => this.abrirLoginModal(), 2000);
      },
      error: (error) => {
        console.error('Erro no cadastro', error);
        this.registerErrorMessage = error.error?.error || 'Erro ao cadastrar. Verifique os dados.';
      }
    });
  }

  // --- Métodos de controle dos Modais (sem alterações) ---
  abrirLoginModal() {
    this.mostrarRegisterModal = false;
    this.mostrarLoginModal = true;
    this.loginHeaderMessage = null; 
    // Limpar campos
    this.loginEmail = '';
    this.loginPassword = '';
    this.loginErrorMessage = '';
  }

  abrirRegisterModal() {
    this.mostrarLoginModal = false;
    this.mostrarRegisterModal = true;
    // Limpar campos
    this.registerUser = { username: '', email: '', password: '', telefone: '', confirmarSenha: '' };
    this.registerSuccessMessage = '';
    this.registerErrorMessage = '';
  }

  fecharModals() {
    this.mostrarLoginModal = false;
    this.mostrarRegisterModal = false;
    this.loginHeaderMessage = null;
  }
}