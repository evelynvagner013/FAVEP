import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuComponent } from "../../navbar/menu/menu.component";
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { CanvasJSChart } from '@canvasjs/angular-charts';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MenuComponent, CanvasJSAngularChartsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  chartOptions = {
    animationEnabled: true,
    title: {
      text: "Fertilizantes"
    },
    exportEnabled: true,
    data: [{
      type: "pie",
      startAngle: -90,
      indexLabel: "{name}: {y}",
      yValueFormatString: "#,###.##'%'",
      dataPoints: [
        { y: 14.1, name: "Ureia (N)" },
        { y: 28.2, name: "Superfosfato Simples (P)" },
        { y: 14.4, name: "Cloreto de Potássio (K)" },
        { y: 43.3, name: "NPK 10-10-10" },
        { y: 43.3, name: "Esterco Bovino" },
        { y: 43.3, name: "Húmus de Minhoca" },
        { y: 43.3, name: "Farinha de Ossos" },
        { y: 43.3, name: "Fosfato Natural" },
        { y: 43.3, name: "Sulfato de Amônio" },
        { y: 43.3, name: "Torta de Mamona" }
      ]
    }]
  }
  

}
