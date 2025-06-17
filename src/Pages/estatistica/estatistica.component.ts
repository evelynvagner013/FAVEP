import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts'; // Not used in Chart.js implementation
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../navbar/menu/menu.component'; // Assuming this is a valid path
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt'; // Importa os dados da localidade pt
import { ApiService } from '../../services/api.service'; // Importe o ApiService

registerLocaleData(localePt);

interface Atividade {
  icone: string;
  descricao: string;
  data: Date;
}

@Component({
  selector: 'app-estatistica',
  standalone: true,
  imports: [
    CommonModule, // For pipes like number, currency, date
    RouterLink,
    MenuComponent,
    // CanvasJSAngularChartsModule, // Only if you intend to use CanvasJS charts elsewhere or switch back
  ],
  templateUrl: './estatistica.component.html',
  styleUrls: ['./estatistica.component.css']
})
export class EstatisticaComponent implements OnInit {
  menuAberto = false;

  alternarMenu() {
    this.menuAberto = !this.menuAberto;
  }

  // Optional: close menu on outside click
  @HostListener('document:click', ['$event'])
  fecharMenuFora(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clicouNoBotao = target.closest('.menu-toggle');
    const clicouNoMenu = target.closest('.main-menu');

    if (!clicouNoBotao && !clicouNoMenu) {
      this.menuAberto = false;
    }
  }

  @ViewChild('produtividadeChart', { static: true }) produtividadeChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('financeiroChart', { static: true }) financeiroChart!: ElementRef<HTMLCanvasElement>;

  usuarioNome: string = '';
  usuarioFoto: string = '';

  totalPropriedades: number = 5;
  areaTotal: number = 12500; // Example: 12,500 ha
  producaoAtual: number = 1250000; // Example: 1,250,000 kg
  culturasAtivas: string[] = ['Soja', 'Milho', 'Algodão'];
  resultadoFinanceiro: number = 125000; // Example: R$ 125,000.00

  atividades: Atividade[] = [
    { icone: 'fa-seedling', descricao: 'Plantio de Soja concluído', data: new Date() },
    { icone: 'fa-tractor', descricao: 'Manutenção preventiva de tratores', data: new Date(Date.now() - 86400000 * 1) }, // 1 day ago
    { icone: 'fa-dollar-sign', descricao: 'Pagamento recebido - Venda de Soja', data: new Date(Date.now() - 86400000 * 2) }, // 2 days ago
    { icone: 'fa-cloud-rain', descricao: 'Previsão de chuva para amanhã', data: new Date(Date.now() - 86400000 * 3) } // 3 days ago (example)
  ];

  // Data for Productivity Chart
  dadosProdutividade: number[] = [6500, 5900, 8000, 4500]; // Example: kg/ha
  culturas: string[] = ['Soja', 'Milho', 'Algodão', 'Trigo'];

  // Data for Financial Chart (Monthly)
  // These would typically come from a service or be more dynamic
  meses: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  dadosReceitasMensais: number[] = [15000, 16000, 17000, 15500, 18000, 19000, 20000, 21000, 19500, 22000, 23000, 24000];
  dadosDespesasMensais: number[] = [8000, 8500, 9000, 8800, 9500, 10000, 10500, 11000, 10200, 11500, 12000, 12500];

  // Note: dadosFinanceiros object is not directly used by the monthly chart,
  // but could be used for a summary or a different chart.
  dadosFinanceiros = {
    receitas: 300000, // Overall or last 30 days, matches resultadoFinanceiro if it's net
    despesas: 175000
  };

  constructor(private apiService: ApiService) { // Injete o ApiService
    // Chart.js V3 and later are tree-shakeable, so you need to register components.
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    const user = this.apiService.getUser();
    if (user) {
      this.usuarioNome = user.nome;
      this.usuarioFoto = user.fotoUrl || 'assets/user-avatar.jpg';
    }
    this.criarGraficos();
  }

  criarGraficos(): void {
    // Productivity Chart
    if (this.produtividadeChart && this.produtividadeChart.nativeElement) {
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
          maintainAspectRatio: false, // Added to better control chart size within its container
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'kg/ha'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Culturas'
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            }
          }
        }
      });
    } else {
      console.error('Elemento canvas #produtividadeChart não encontrado.');
    }

    // Financial Chart (Revenue x Expenses Monthly)
    if (this.financeiroChart && this.financeiroChart.nativeElement) {
      new Chart(this.financeiroChart.nativeElement, {
        type: 'bar', // Could also be 'line' for time-series data
        data: {
          labels: this.meses,
          datasets: [
            {
              label: 'Receitas',
              data: this.dadosReceitasMensais,
              backgroundColor: 'rgba(40, 167, 69, 0.6)', // Green for revenue
              borderColor: 'rgba(40, 167, 69, 1)',
              borderWidth: 1
            },
            {
              label: 'Despesas',
              data: this.dadosDespesasMensais,
              backgroundColor: 'rgba(220, 53, 69, 0.6)', // Red for expenses
              borderColor: 'rgba(220, 53, 69, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, // Added for better control
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Valor (R$)'
              },
              // Optional: Format Y-axis labels as currency if needed
              // ticks: {
              //   callback: function(value, index, values) {
              //     return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
              //   }
              // }
            },
            x: {
              title: {
                display: true,
                text: 'Mês'
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          }
        }
      });
    } else {
      console.error('Elemento canvas #financeiroChart não encontrado.');
    }
  }
}
