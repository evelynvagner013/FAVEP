import { Component } from '@angular/core';


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  usuarioNome: string = 'João Agricultor';
  usuarioFoto: string = 'assets/user-avatar.jpg';

  
}


