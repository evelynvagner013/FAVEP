import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuComponent } from '../../navbar/menu/menu.component';

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [RouterLink, MenuComponent],
  templateUrl: './relatorio.component.html',
  styleUrl: './relatorio.component.css'
})
export class RelatorioComponent {
  files = [
    { name: 'Formulário 1', url: '/assets/form1.pdf' },
    { name: 'Formulário 2', url: '/assets/form2.pdf' },
    { name: 'Formulário 3', url: '/assets/form3.pdf' },
    { name: 'Formulário 4', url: '/assets/form4.pdf' },
    { name: 'Formulário 5', url: '/assets/form5.pdf' }
  ];

  usuarioNome: string = 'João Agricultor';
  usuarioFoto: string = 'assets/user-avatar.jpg';

    menuAberto = false;

  alternarMenu() {
    this.menuAberto = !this.menuAberto;
  }

  // Opcional: fecha o menu ao clicar fora
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
