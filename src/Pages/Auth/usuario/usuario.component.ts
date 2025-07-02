import { Component, HostListener, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT, CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
// Importa a interface Usuario diretamente da ApiService para garantir consistência
import { ApiService, Usuario } from '../../../services/api.service';

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

  menuAberto = false;
  usuarioNome: string = 'Carregando...';
  usuarioFoto: string = 'https://placehold.co/40x40/aabbcc/ffffff?text=User';

  // Usa a interface Usuario importada da ApiService
  
  usuario: Usuario = {
    id: '', // ID é obrigatório se for um usuário existente
    nome: 'Usuário Padrão', // Valor inicial
    email: '',
    telefone: '',
    fotoPerfil: 'assets/img/usuario.jpg',
    senha: 'defaultPassword' // fotoPerfil em vez de fotoUrl
  };

  // 'usuarioEditavel' para o modal de edição. Removidos campos de plano
  usuarioEditavel: Partial<Usuario> = {};

  editModalAberto = false;
  // Removidas propriedades relacionadas ao modal de plano
  // planoModalAberto = false;
  // planoSelecionado: string = '';

  constructor(
    private datePipe: DatePipe,
    private router: Router,
    private apiService: ApiService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.carregarPerfilUsuario(); // Chama o método para carregar o perfil do usuário
  }

  carregarPerfilUsuario(): void {
    // Busca o usuário logado do localStorage via ApiService
    const userLocal = this.apiService.getUser();

    if (userLocal && userLocal.id) { // Verifica se há um usuário no localStorage e se ele tem um ID
      // Tenta buscar o perfil completo do backend, caso haja um ID
      this.apiService.getPerfilUsuario().subscribe({
        next: (userFromApi) => {
          if (userFromApi) {
            // Atualiza o objeto 'usuario' do componente com os dados da API
            this.usuario = {
              ...userFromApi,
              fotoPerfil: userFromApi.fotoPerfil || 'assets/img/usuario.jpg', // Garante uma foto padrão
            };
          } else {
            // Se a API não retornou o usuário (ex: token inválido, user não encontrado)
            // Usa os dados do localStorage como fallback e faz logout para forçar reautenticação.
            console.warn('Perfil não encontrado na API. Usando dados do localStorage e fazendo logout.');
            this.usuario = {
                ...userLocal,
                fotoPerfil: userLocal.fotoPerfil || 'assets/img/usuario.jpg',
            };
            this.apiService.logout(); // Sugestão: Forçar logout se o perfil da API falhar
            this.router.navigate(['/home']);
          }
          this.atualizarHeaderInfo(); // Atualiza as informações de exibição no cabeçalho
          this.usuarioEditavel = { ...this.usuario }; // Inicializa usuarioEditavel
        },
        error: (err) => {
          console.error('Erro ao carregar perfil do usuário da API:', err);
          // Se houver erro na API, use os dados do localStorage como fallback
          this.usuario = {
              ...userLocal,
              fotoPerfil: userLocal.fotoPerfil || 'assets/img/usuario.jpg',
          };
          this.atualizarHeaderInfo();
          this.usuarioEditavel = { ...this.usuario };
        }
      });
    } else {
      // Se não há usuário logado ou sem ID no localStorage, redireciona para o login
      console.warn('Usuário não logado ou sem ID no localStorage. Redirecionando para home.');
      this.apiService.logout(); // Garante que não há dados inconsistentes
      this.router.navigate(['/home']);
    }
  }

  // Métodos do menu lateral
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
    // Inicializa usuarioEditavel para edição.
    this.usuarioEditavel = {
      ...this.usuario,
      // Removidas as conversões de data, pois os campos de plano foram removidos
    };
    this.editModalAberto = true;
  }

  fecharModalEdicao(): void {
    this.editModalAberto = false;
  }

  salvarAlteracoesPerfil(): void {
    if (!this.usuarioEditavel.id) {
      console.error('ID do usuário não disponível para atualização.');
      return;
    }

    // Prepara o payload para enviar à API. Removidos campos de plano
    const payload: Partial<Usuario> = {
      nome: this.usuarioEditavel.nome,
      email: this.usuarioEditavel.email,
      telefone: this.usuarioEditavel.telefone,
      fotoPerfil: this.usuarioEditavel.fotoPerfil,
    };

    this.apiService.atualizarPerfilUsuario(this.usuarioEditavel.id, payload).subscribe({
      next: (updatedUser) => {
        console.log('Perfil atualizado com sucesso:', updatedUser);
        // Atualiza o objeto 'usuario' local com os dados retornados pela API
        this.usuario = {
            ...updatedUser,
            fotoPerfil: updatedUser.fotoPerfil || 'assets/img/usuario.jpg',
        };
        // Atualizar o usuário no localStorage via apiService para manter a sessão atualizada
        this.apiService.setUser(this.usuario);

        this.atualizarHeaderInfo(); // Atualiza as informações de exibição
        this.fecharModalEdicao();
        alert('Perfil atualizado com sucesso!'); // Feedback para o usuário
      },
      error: (err) => {
        console.error('Erro ao salvar alterações no perfil:', err);
        alert('Erro ao atualizar perfil. Tente novamente.'); // Feedback de erro
      }
    });
  }



  private atualizarHeaderInfo(): void {
    // Garante que o usuario está definido antes de acessar suas propriedades
    if (this.usuario) {
      this.usuarioNome = this.usuario.nome;
      this.usuarioFoto = this.usuario.fotoPerfil || 'assets/img/usuario.jpg'; // Usando fotoPerfil
    }
  }

  navegarParaContato(): void {
    this.router.navigate(['/contato']);
  }
}