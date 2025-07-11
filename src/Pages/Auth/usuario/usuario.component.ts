import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// --- Imports Corrigidos ---
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/api.models';

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
  usuarioNome: string = '';
  usuarioFoto: string = 'https://placehold.co/40x40/aabbcc/ffffff?text=User';

  // O objeto 'usuario' representa o estado atual do perfil no componente
  usuario: Usuario = {
    id: '',
    nome: '',
    email: '',
    telefone: '',
    fotoPerfil: 'https://placehold.co/40x40/aabbcc/ffffff?text=User',
    senha: '' // Senha nunca é manipulada ou exibida
  };

  // Usado para o formulário de edição, para não alterar o 'usuario' principal diretamente
  usuarioEditavel: Partial<Usuario> = {};

  editModalAberto = false;

  // --- Construtor Corrigido ---
  constructor(
    private router: Router,
    private authService: AuthService, // Usa o serviço de autenticação
    private usuarioService: UsuarioService // Usa o serviço de usuário
  ) { }

  ngOnInit(): void {
    this.carregarPerfilUsuario();
  }

  // --- Lógica de Carregamento Corrigida ---
  carregarPerfilUsuario(): void {
    // Busca o perfil mais recente da API usando o UsuarioService
    this.usuarioService.getPerfilUsuario().subscribe({
      next: (userFromApi) => {
        if (userFromApi) {
          // Se a API retornou o usuário, ele é nossa fonte da verdade
          this.usuario = {
            ...userFromApi,
            fotoPerfil: userFromApi.fotoPerfil || 'https://placehold.co/40x40/aabbcc/ffffff?text=User',
            senha: '' // Garante que a senha nunca seja armazenada no estado do componente
          };
          // Atualiza o localStorage com os dados mais recentes via AuthService
          this.authService.setUser(this.usuario);
          this.atualizarHeaderInfo();
        } 
      },
      error: (err) => {
        console.error('Erro de rede ao carregar perfil. Tentando usar dados locais.', err);
        // Em caso de erro (ex: offline), tenta usar os dados do localStorage
        const userLocal = this.authService.getUser();
        if (userLocal) {
          this.usuario = { ...userLocal, senha: '' };
          this.atualizarHeaderInfo();
        } else {
          this.authService.logout();
        }
      }
    });
  }

  // --- Lógica de Salvamento Corrigida ---
  salvarAlteracoesPerfil(): void {
    if (!this.usuarioEditavel.id) {
      console.error('ID do usuário não disponível para atualização.');
      return;
    }

    // O payload não deve conter o ID, pois ele vai na URL
    const { id, ...payload } = this.usuarioEditavel;

    this.usuarioService.atualizarPerfilUsuario(id, payload).subscribe({
      next: (updatedUser) => {
        console.log('Perfil atualizado com sucesso:', updatedUser);
        
        // Atualiza o estado principal do componente
        this.usuario = {
          ...this.usuario,
          ...updatedUser,
          fotoPerfil: updatedUser.fotoPerfil || 'https://placehold.co/40x40/aabbcc/ffffff?text=User',
        };

        // Atualiza o usuário no localStorage para manter a sessão consistente
        this.authService.setUser(this.usuario);

        this.atualizarHeaderInfo();
        this.fecharModalEdicao();
        alert('Perfil atualizado com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao salvar alterações no perfil:', err);
        alert('Erro ao atualizar perfil. Tente novamente.');
      }
    });
  }

  // --- Métodos de UI e Navegação (sem alterações na lógica) ---

  private atualizarHeaderInfo(): void {
    if (this.usuario) {
      this.usuarioNome = this.usuario.nome;
      this.usuarioFoto = this.usuario.fotoPerfil || 'https://placehold.co/40x40/aabbcc/ffffff?text=User';
    }
  }

  abrirModalEdicao(): void {
    // Clona o usuário atual para o objeto de edição
    this.usuarioEditavel = { ...this.usuario };
    this.editModalAberto = true;
  }

  fecharModalEdicao(): void {
    this.editModalAberto = false;
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

  navegarParaContato(): void {
    this.router.navigate(['/contato']);
  }
}