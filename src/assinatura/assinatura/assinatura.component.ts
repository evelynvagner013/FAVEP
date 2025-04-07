import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuComponent } from "../../navbar/menu/menu.component";

@Component({
  selector: 'app-assinatura',
  standalone: true,
  imports: [RouterLink, MenuComponent],
  templateUrl: './assinatura.component.html',
  styleUrl: './assinatura.component.css'
})
export class AssinaturaComponent {

}
