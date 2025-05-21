import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { MenuComponent } from '../navbar/menu/menu.component';
import { MenuCimaComponent } from '../navbar/menu-cima/menu-cima.component';
import { FooterComponent } from '../footer/footer.component';
import { AssinaturaComponent } from '../assinatura/assinatura/assinatura.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MenuCimaComponent, 
    FooterComponent,
    AssinaturaComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  


}
