import { Component } from '@angular/core';
import { MenuComponent } from '../../navbar/menu/menu.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-gerenciamento',
  standalone: true,
  imports: [MenuComponent, RouterLink],
  templateUrl: './gerenciamento.component.html',
  styleUrl: './gerenciamento.component.css'
})
export class GerenciamentoComponent {

}
