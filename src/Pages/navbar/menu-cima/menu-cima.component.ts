import { Component } from '@angular/core';
import { LoginComponent } from '../../Auth/login/login.component';

@Component({
  selector: 'app-menu-cima',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './menu-cima.component.html',
  styleUrl: './menu-cima.component.css'
})
export class MenuCimaComponent {

}
