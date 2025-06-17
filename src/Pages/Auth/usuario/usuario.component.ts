import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // CommonModule para *ngIf, etc., DatePipe para formatar datas
import { FormsModule } from '@angular/forms';           // FormsModule para [(ngModel)]
import { Router, RouterLink } from '@angular/router'; // RouterLink para navegação e Router para navegação programática
import { ApiService } from '../../../services/api.service'; // Importe o ApiService

// Interface para tipar o objeto de usuário
interface Usuario {
  id?: string; // Adicionado para consistência
  nome: string;
  email: string;
  telefone: string;
  fotoUrl?: string; // fotoUrl é opcional
  plano?: string;
  dataAssinatura?: Date | string; // Usar Date para manipulação interna, string para display/input se necessário
  dataValidade?: Date | string;
}

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink // Necessário se você usar routerLink em outros lugares no template
  ],
  providers: [DatePipe], // DatePipe precisa ser provido
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {
  // Propriedades para o menu lateral
  menuAberto = false;

  // Propriedades para o cabeçalho (serão preenchidas a partir do objeto 'usuario')
  headerUsuarioNome: string = '';
  headerUsuarioFoto: string = '';

  // Dados do perfil do usuário
  usuario: Usuario = {
    nome: '',
    email: '',
    telefone: '',
    fotoUrl: 'assets/img/usuario.jpg', // Imagem padrão
    plano: 'Anual',
    dataAssinatura: new Date('2025-07-19'),
    dataValidade: new Date('2026-07-19')
  };

  // Objeto para o formulário de edição do modal
  usuarioEditavel!: Usuario; // '!' indica que será inicializado no ngOnInit

  // Controle de visibilidade do modal de edição
  editModalAberto = false;

  // 1. Injete o Router no construtor
  constructor(
    private datePipe: DatePipe,
    private router: Router, // Injetar o serviço Router
    private apiService: ApiService // Injete o ApiService
  ) { }

  ngOnInit(): void {
    const user = this.apiService.getUser();
    if (user) {
      this.usuario = {
        ...this.usuario, // Mantém padrões como plano e datas, se não vierem do back-end
        ...user,
        fotoUrl: user.fotoUrl || 'assets/img/usuario.jpg'
      };
    }

    // Inicializa as informações do cabeçalho com os dados do perfil
    this.atualizarHeaderInfo();
    // Inicializa usuarioEditavel com uma cópia dos dados do usuário para o modal
    // Isso evita que alterações no formulário afetem 'this.usuario' antes de salvar
    this.usuarioEditavel = { ...this.usuario };
  }

  // --- Métodos para controle do menu lateral ---
  alternarMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  @HostListener('document:click', ['$event'])
  fecharMenuFora(event: MouseEvent): void {
    const alvo = event.target as HTMLElement;
    const clicouNoBotao = alvo.closest('.menu-toggle');
    const clicouNoMenu = alvo.closest('.main-menu');

    // Só fecha o menu se estiver aberto e o clique for fora dos elementos especificados
    if (this.menuAberto && !clicouNoBotao && !clicouNoMenu) {
      this.menuAberto = false;
    }
  }

  // --- Métodos para o modal de edição do perfil ---
  abrirModalEdicao(): void {
    // Cria uma cópia nova dos dados atuais do usuário para edição
    this.usuarioEditavel = {
      ...this.usuario,
      // Se for usar <input type="date">, pode ser necessário formatar as datas aqui
      // dataAssinatura: this.datePipe.transform(this.usuario.dataAssinatura, 'yyyy-MM-dd') || '',
      // dataValidade: this.datePipe.transform(this.usuario.dataValidade, 'yyyy-MM-dd') || ''
    };
    this.editModalAberto = true;
  }

  fecharModalEdicao(): void {
    this.editModalAberto = false;
  }

  salvarAlteracoesPerfil(): void {
    // Salva as alterações no objeto principal do usuário
    this.usuario = {
        ...this.usuarioEditavel,
        // Se as datas foram formatadas para string no modal, converta-as de volta para Date aqui se necessário
        // dataAssinatura: new Date(this.usuarioEditavel.dataAssinatura + 'T00:00:00'),
        // dataValidade: new Date(this.usuarioEditavel.dataValidade + 'T00:00:00')
    };

    // Atualiza as informações do cabeçalho também
    this.atualizarHeaderInfo();
    this.fecharModalEdicao();

    console.log('Perfil salvo:', this.usuario);
    // Aqui você chamaria um serviço para persistir os dados no backend em uma aplicação real
    // Adicionar feedback visual para o usuário (ex: toast message de sucesso) é uma boa prática
  }

  // --- Método auxiliar para atualizar informações do header ---
  private atualizarHeaderInfo(): void {
    this.headerUsuarioNome = this.usuario.nome;
    this.headerUsuarioFoto = this.usuario.fotoUrl || 'assets/img/usuario.jpg';
  }

  // 2. Adicione o método para navegação
  /**
   * Navega para a página de contato.
   * Este método é chamado quando o botão "CONTATE-NOS" é clicado.
   */
  navegarParaContato(): void {
    // Certifique-se de que a rota '/contato' está definida
    // no seu ficheiro de configuração de rotas (ex: app.routes.ts).
    this.router.navigate(['/contato']);
    console.log('Tentativa de navegação para /contato'); // Para depuração
  }
}
