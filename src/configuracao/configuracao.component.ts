import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-configuracao',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl:'./configuracao.component.html',
  styleUrl: './configuracao.component.css'
})
export class ConfiguracaoComponent {

}
