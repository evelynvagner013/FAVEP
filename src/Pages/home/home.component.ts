import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { MenuComponent } from '../navbar/menu/menu.component';
import { MenuCimaComponent } from '../navbar/menu-cima/menu-cima.component';
import { FooterComponent } from '../footer/footer.component';
import { AssinaturaComponent } from '../assinatura/assinatura/assinatura.component';

interface ParceiroDestaque {
  nome: string;
  descricao: string;
  logoUrl: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MenuCimaComponent, 
    FooterComponent,
    AssinaturaComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
 parceiros: ParceiroDestaque[] = [
    {
      nome: 'AgroTech Solutions',
      descricao: 'Líder em soluções tecnológicas para o agronegócio, oferecendo softwares de gestão e monitoramento de precisão para otimizar a produção agrícola e pecuária.',
      logoUrl: 'assets/img/agrotech-logo.png' // Substitua pelo caminho real da logo
    },
    {
      nome: 'BioFertilizantes Campo Verde',
      descricao: 'Especializada no desenvolvimento e produção de fertilizantes orgânicos e biológicos, promovendo uma agricultura sustentável e de alta produtividade.',
      logoUrl: 'assets/img/campoverde-logo.png' // Substitua pelo caminho real da logo
    }
  ];

}
