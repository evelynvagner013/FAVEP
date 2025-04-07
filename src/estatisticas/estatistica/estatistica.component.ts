import { Component, ViewChild } from '@angular/core';
import { MenuComponent } from "../../navbar/menu/menu.component";
import { RouterLink } from '@angular/router';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { CanvasJSChart } from '@canvasjs/angular-charts';



@Component({
  selector: 'app-estatistica',
  standalone: true,
  imports: [MenuComponent, RouterLink, CanvasJSAngularChartsModule],
  templateUrl: './estatistica.component.html',
  styleUrls: ['./estatistica.component.css']
})
export class EstatisticaComponent {
  @ViewChild('chartComponent') chartComponent!: CanvasJSChart;
  @ViewChild('chartComponent1') chartComponent1!: CanvasJSChart;
  @ViewChild('chartComponent2') chartComponent2!: CanvasJSChart;
  @ViewChild('chartComponent3') chartComponent3!: CanvasJSChart;

  // Gráfico de Pizza - Fertilizantes
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

  // Gráfico de Linha - Tráfego do Website
  chartOptions1 = { 
    animationEnabled: true, 
    theme: "light", 
    title: {
      text: "Renda" 
    },
    axisX: {
      valueFormatString: "DD MMM", 
      crosshair: { 
        enabled: true, 
        snapToDataPoint: true 
      }
    },
    axisY: { 
      title: "Renda mensal", 
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
      name: "Lucro", 
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
      name: "Despesas", 
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
  chartOptions2 = { 
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

  // Gráfico de Dispersão - CPU vs Usuários
  chartOptions3 = { 
    animationEnabled: true, 
    exportEnabled: true, 
    theme: "white", 
    title: { 
      text: "Utilização da CPU do servidor vs. usuários ativos" 
    },
    axisX: { 
      title: "Usuários ativos" 
    },
    axisY: { 
      title: "Utilização da CPU", 
      suffix: "%" 
    },
    legend: { 
      cursor: "pointer", 
      itemclick: function(e: any) {  
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {    
          e.dataSeries.visible = false; 
        } else {  
          e.dataSeries.visible = true; 
        }
        e.chart.render();
      }
    },
    data: [{ 
      type: "scatter", 
      name: "Servidor 7", 
      markerType: "cross", 
      yValueFormatString: "##.##%", 
      showInLegend: true, 
      toolTipContent: "<span style='color: {color};'>{name}</span><br>Usuários ativos: {x}<br>Utilização da CPU: {y}%", 
      dataPoints: [ 
        { x: 100, y: 10 }, { x: 110, y: 15 }, { x: 130, y: 17 }, { x: 140, y: 19 }, 
        { x: 145, y: 21 }, { x: 400, y: 25 }, { x: 430, y: 27 }, { x: 444, y: 30 }, 
        { x: 460, y: 29 }, { x: 490, y: 35 }, { x: 500, y: 40 }, { x: 510, y: 50 }, 
        { x: 600, y: 30 }, { x: 700, y: 35 }, { x: 800, y: 40 }, { x: 900, y: 45 }, 
        { x: 1000, y: 47 }, { x: 1200, y: 55 }, { x: 1230, y: 51 }, { x: 1300, y: 60 }, 
        { x: 1330, y: 65 }, { x: 1400, y: 70 }, { x: 1450, y: 71 }, { x: 1500, y: 69 }
      ]
    },
    {
      type: "scatter", 
      name: "Servidor 2", 
      showInLegend: true, 
      markerType: "square", 
      toolTipContent: "<span style='color: {color};'>{name}</span><br>Usuários ativos: {x}<br>Utilização da CPU: {y}%", 
      dataPoints: [ 
        { x: 100, y: 25 }, { x: 110, y: 35 }, { x: 130, y: 35 }, { x: 140, y: 40 }, 
        { x: 145, y: 45 }, { x: 400, y: 42 }, { x: 430, y: 32 }, { x: 444, y: 35 }, 
        { x: 460, y: 43 }, { x: 490, y: 50 }, { x: 500, y: 57 }, { x: 510, y: 67 }, 
        { x: 600, y: 40 }, { x: 700, y: 46 }, { x: 800, y: 50 }, { x: 900, y: 60 }, 
        { x: 1000, y: 66 }, { x: 1200, y: 79 }, { x: 1230, y: 60 }, { x: 1300, y: 75 }, 
        { x: 1330, y: 80 }, { x: 1400, y: 82 }, { x: 1450, y: 88 }, { x: 1500, y: 87 }
      ]
    }]
  };

  // Métodos de exportação para cada gráfico
  baixarJPG(chartNumber: number) {
    const chart = this.getChartComponent(chartNumber);
    if (chart && chart.chart) {
      chart.chart.exportChart({format: "jpg"});
    }
  }

  imprimirGrafico(chartNumber: number) {
    const chart = this.getChartComponent(chartNumber);
    if (chart && chart.chart) {
      chart.chart.print();
    }
  }

  private getChartComponent(chartNumber: number): CanvasJSChart | null {
    switch(chartNumber) {
      case 1: return this.chartComponent;
      case 2: return this.chartComponent1;
      case 3: return this.chartComponent2;
      case 4: return this.chartComponent3;
      default: return null;
    }
  }
}