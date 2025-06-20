import { Component, HostListener, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT, CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';

interface Usuario {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  fotoUrl?: string;
  plano?: string;
  dataAssinatura?: Date | string;
  dataValidade?: Date | string;
}

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  providers: [DatePipe],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {
  
  public contentTheme: 'light' | 'dark' = 'light';
  menuAberto = false;
  headerUsuarioNome: string = '';
  headerUsuarioFoto: string = '';

  usuario: Usuario = {
    nome: '',
    email: '',
    telefone: '',
    fotoUrl: 'assets/img/usuario.jpg',
    plano: 'Anual',
    dataAssinatura: new Date('2025-07-19'),
    dataValidade: new Date('2025-06-27')
  };

  usuarioEditavel!: Usuario;
  editModalAberto = false;
  planoModalAberto = false;
  planoSelecionado: string = '';

  constructor(
    private datePipe: DatePipe,
    private router: Router,
    private apiService: ApiService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    const user = this.apiService.getUser();
    if (user) {
      this.usuario = {
        ...this.usuario,
        ...user,
        fotoUrl: user.fotoUrl || 'assets/img/usuario.jpg'
      };
    }
    this.atualizarHeaderInfo();
    this.usuarioEditavel = { ...this.usuario };

    this.contentTheme = localStorage.getItem('contentTheme') as 'light' | 'dark' || 'light';
    this.applyContentTheme();
  }

  toggleTheme(): void {
    this.contentTheme = this.contentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('contentTheme', this.contentTheme);
    this.applyContentTheme();
  }

  private applyContentTheme(): void {
    const container = this.document.getElementById('dashboard-container');
    if (container) {
      if (this.contentTheme === 'dark') {
        this.renderer.addClass(container, 'content-dark-theme');
      } else {
        this.renderer.removeClass(container, 'content-dark-theme');
      }
    }
  }

  alternarMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  @HostListener('document:click', ['$event'])
  fecharMenuFora(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.menuAberto && !target.closest('.menu-toggle') && !target.closest('.main-menu')) {
      this.menuAberto = false;
    }
  }

  abrirModalEdicao(): void {
    this.usuarioEditavel = { ...this.usuario };
    this.editModalAberto = true;
  }

  fecharModalEdicao(): void {
    this.editModalAberto = false;
  }

  salvarAlteracoesPerfil(): void {
    this.usuario = { ...this.usuarioEditavel };
    this.atualizarHeaderInfo();
    this.fecharModalEdicao();
    console.log('Perfil salvo:', this.usuario);
  }

  abrirModalPlano(): void {
    this.planoSelecionado = this.usuario.plano || '';
    this.planoModalAberto = true;
  }

  fecharModalPlano(): void {
    this.planoModalAberto = false;
  }

  salvarAlteracaoPlano(): void {
    alert(`Seu plano será alterado para ${this.planoSelecionado}.`);
    this.usuario.plano = this.planoSelecionado;
    console.log('Novo plano salvo:', this.usuario.plano);
    this.fecharModalPlano();
  }

  efetuarCancelamentoAssinatura(): void {
    const confirmacao = confirm('Tem certeza de que deseja cancelar sua assinatura?');
    if (confirmacao) {
      alert('Sua assinatura foi cancelada. Você continuará com acesso até o fim do período de validade.');
      this.usuario.plano = 'Cancelado';
      console.log(`Assinatura cancelada para o usuário: ${this.usuario.email}`);
      this.fecharModalPlano();
    }
  }

  private atualizarHeaderInfo(): void {
    this.headerUsuarioNome = this.usuario.nome;
    this.headerUsuarioFoto = this.usuario.fotoUrl || 'assets/img/usuario.jpg';
  }

  navegarParaContato(): void {
    this.router.navigate(['/contato']);
  }
}