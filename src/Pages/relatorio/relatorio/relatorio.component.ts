import { Component, HostListener, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importação correta
import { MenuComponent } from '../../navbar/menu/menu.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [RouterLink, MenuComponent, CommonModule],
  templateUrl: './relatorio.component.html',
  styleUrl: './relatorio.component.css'
})
export class RelatorioComponent implements OnInit {
  
  public contentTheme: 'light' | 'dark' = 'light';
  files = [
    { name: 'Formulário 1', url: '/assets/form1.pdf' },
    { name: 'Formulário 2', url: '/assets/form2.pdf' },
    { name: 'Formulário 3', url: '/assets/form3.pdf' },
    { name: 'Formulário 4', url: '/assets/form4.pdf' },
    { name: 'Formulário 5', url: '/assets/form5.pdf' }
  ];

  usuarioNome: string = '';
  usuarioFoto: string = '';
  menuAberto = false;

  constructor(
    private apiService: ApiService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    const user = this.apiService.getUser();
    if (user) {
      this.usuarioNome = user.nome;
      this.usuarioFoto = user.fotoUrl || 'assets/user-avatar.jpg';
    }

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

  alternarMenu() {
    this.menuAberto = !this.menuAberto;
  }

  @HostListener('document:click', ['$event'])
  fecharMenuFora(event: MouseEvent) {
    const alvo = event.target as HTMLElement;
    const clicouNoBotao = alvo.closest('.menu-toggle');
    const clicouNoMenu = alvo.closest('.main-menu');

    if (!clicouNoBotao && !clicouNoMenu) {
      this.menuAberto = false;
    }
  }
}