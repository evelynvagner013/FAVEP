import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { RouterLink } from '@angular/router';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../navbar/menu/menu.component';

interface Atividade {
  icone: string;
  descricao: string;
  data: Date;
}

@Component({
  selector: 'app-estatistica',
  standalone: true,
  imports: [MenuComponent, RouterLink, CanvasJSAngularChartsModule, CommonModule ],
  templateUrl: './estatistica.component.html',
  styleUrls: ['./estatistica.component.css']
})

export class EstatisticaComponent implements OnInit {
  @ViewChild('produtividadeChart', { static: true }) produtividadeChart!: ElementRef;
  @ViewChild('financeiroChart', { static: true }) financeiroChart!: ElementRef;

 usuarioNome: string = 'João Agricultor';
  usuarioFoto: string = 'assets/user-avatar.jpg'; 

  totalPropriedades: number = 5;
  areaTotal: number = 12500;
  producaoAtual: number = 1250000;
  culturasAtivas: string[] = ['Soja', 'Milho', 'Algodão'];
  resultadoFinanceiro: number = 125000;

  atividades: Atividade[] = [
    { icone: 'fa-seedling', descricao: 'Plantio de Soja concluído', data: new Date() },
    { icone: 'fa-tractor', descricao: 'Manutenção preventiva de tratores', data: new Date(Date.now() - 86400000) },
    { icone: 'fa-dollar-sign', descricao: 'Pagamento recebido - Venda de Soja', data: new Date(Date.now() - 172800000) },
    { icone: 'fa-cloud-rain', descricao: 'Previsão de chuva para amanhã', data: new Date(Date.now() - 259200000) }
  ];

  dadosProdutividade: number[] = [65, 59, 80, 45];
  culturas: string[] = ['Soja', 'Milho', 'Algodão', 'Trigo'];

  dadosFinanceiros = {
    receitas: 300000,
    despesas: 175000
  };

  ngOnInit(): void {
    Chart.register(...registerables);
    this.criarGraficos();
  }

  criarGraficos(): void {
    // Gráfico de produtividade
    new Chart(this.produtividadeChart.nativeElement, {
      type: 'bar',
      data: {
        labels: this.culturas,
        datasets: [{
          label: 'Produtividade (kg/ha)',
          data: this.dadosProdutividade,
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    // Gráfico financeiro
    new Chart(this.financeiroChart.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Receitas', 'Despesas'],
        datasets: [{
          data: [this.dadosFinanceiros.receitas, this.dadosFinanceiros.despesas],
          backgroundColor: [
            'rgba(40, 167, 69, 0.6)',
            'rgba(220, 53, 69, 0.6)'
          ],
          borderColor: [
            'rgba(40, 167, 69, 1)',
            'rgba(220, 53, 69, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });
  }
}
