import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuComponent } from "../../navbar/menu/menu.component";
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

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
  };

  chartOptions1 = {
    animationEnabled: true,
    theme: "light",
    title: {
      text: "Cotação"
    },
    axisX: {
      valueFormatString: "DD MMM",
      crosshair: {
        enabled: true,
        snapToDataPoint: true
      }
    },
    axisY: {
      title: "Cotação do café",
      crosshair: {
        enabled: true
      }
    },
    toolTip: {
      shared: true
    },
    legend: {
      cursor: "pointer",
      verticalAlign: "bottom",
      horizontalAlign: "right",
      dockInsidePlotArea: true,
      itemclick: function(e: any) {
        if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
          e.dataSeries.visible = false;
        } else {
          e.dataSeries.visible = true;
        }
        e.chart.render();
      }
    },
    exportEnabled: true,
    data: [{
      type: "line",
      showInLegend: true,
      name: "$Venda",
      lineDashType: "dash",
      markerType: "square",
      xValueFormatString: "DD MMM, YYYY",
      dataPoints: [
        { x: new Date(2022, 0, 3), y: 650 },
        { x: new Date(2022, 0, 4), y: 700 },
        { x: new Date(2022, 0, 5), y: 710 },
        { x: new Date(2022, 0, 6), y: 658 },
        { x: new Date(2022, 0, 7), y: 734 },
        { x: new Date(2022, 0, 8), y: 963 },
        { x: new Date(2022, 0, 9), y: 847 },
        { x: new Date(2022, 0, 10), y: 853 },
        { x: new Date(2022, 0, 11), y: 869 },
        { x: new Date(2022, 0, 12), y: 943 },
        { x: new Date(2022, 0, 13), y: 970 },
        { x: new Date(2022, 0, 14), y: 869 },
        { x: new Date(2022, 0, 15), y: 890 },
        { x: new Date(2022, 0, 16), y: 930 }
      ]
    },
    {
      type: "line",
      showInLegend: true,
      name: "$Compra",
      lineDashType: "dot",
      dataPoints: [
        { x: new Date(2022, 0, 3), y: 510 },
        { x: new Date(2022, 0, 4), y: 560 },
        { x: new Date(2022, 0, 5), y: 540 },
        { x: new Date(2022, 0, 6), y: 558 },
        { x: new Date(2022, 0, 7), y: 544 },
        { x: new Date(2022, 0, 8), y: 693 },
        { x: new Date(2022, 0, 9), y: 657 },
        { x: new Date(2022, 0, 10), y: 663 },
        { x: new Date(2022, 0, 11), y: 639 },
        { x: new Date(2022, 0, 12), y: 673 },
        { x: new Date(2022, 0, 13), y: 660 },
        { x: new Date(2022, 0, 14), y: 562 },
        { x: new Date(2022, 0, 15), y: 643 },
        { x: new Date(2022, 0, 16), y: 570 }
      ]
    }]
  };

    // Gráfico de Colunas - Entrada vs Saída
    chartOptions3 = { 
      animationEnabled: true, 
      title: { 
        text: "Entrada vs. Saída" 
      },
      axisX: { 
        labelAngle: -90 
      },
      axisY: { 
        title: "Entrada" 
      },
      toolTip: { 
        shared: true 
      },
      legend: {
        cursor: "pointer",
        itemclick: function(e: any) {  
          if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {     
            e.dataSeries.visible = false; 
          } else { 
            e.dataSeries.visible = true; 
          }
          e.chart.render();
        }
      },
      exportEnabled: true,
      data: [{ 
        type: "column", 	
        name: "Entrada", 
        legendText: "Entrada", 
        showInLegend: true,  
        dataPoints: [
          { label: "Janeiro", y: 262 },  
          { label: "Fevereiro", y: 211 },  
          { label: "Março", y: 175 },  
          { label: "Abril", y: 137 },  
          { label: "Maio", y: 115 },  
          { label: "Junho", y: 104 },  
          { label: "Julho", y: 97.8 },  
          { label: "Agosto", y: 60 },  
          { label: "Setembro", y: 23.3 },  
          { label: "Outubro", y: 20.4 },
          { label: "Novembro", y: 10.3 },
          { label: "Dezembro", y: 300 }   
        ]
      }, { 
        type: "column", 	
        name: "Saída", 
        legendText: "Saída", 
        axisYType: "secondary", 
        showInLegend: true, 
        dataPoints: [
          { label: "Janeiro", y: 11.15 },  
          { label: "Fevereiro", y: 2.5 },  
          { label: "Março", y: 3.6 },  
          { label: "Abril", y: 4.2 },  
          { label: "Maio", y: 2.6 },  
          { label: "Junho", y: 2.7 },  
          { label: "Julho", y: 3.1 },  
          { label: "Agosto", y: 10.23 },  
          { label: "Setembro", y: 10.3 },  
          { label: "Outubro", y: 4.3 },
          { label: "Novembro", y: 8.3 },
          { label: "Dezembro", y: 10.3 }   
        ]
      }]
    };


}
