import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../navbar/menu/menu.component'; // Mantido conforme seu código
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ApiService, UserProfile, Property, Crop, FinancialRecord } from '../../services/api.service'; // Importe o ApiService e as interfaces
import { HttpClientModule } from '@angular/common/http'; // Importa HttpClientModule para componentes standalone

registerLocaleData(localePt);

// CORREÇÃO AQUI: A interface Atividade agora usa 'description' para corresponder ao backend
interface Atividade {
  _id: string; // Adicionado _id para corresponder à interface do ApiService
  description: string; // Alterado de 'descricao' para 'description'
  date: Date;
  type: string; // Adicionado 'type' para corresponder à interface do ApiService
  icone?: string; // Propriedade opcional para o ícone do frontend
}

@Component({
  selector: 'app-estatistica', // Seu seletor atual
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MenuComponent, // Mantido conforme seu código
    HttpClientModule // Necessário para que o HttpClient funcione em um componente standalone
  ],
  templateUrl: './estatistica.component.html', // Seu template atual
  styleUrls: ['./estatistica.component.css'] // Seu estilo atual
})
// CORREÇÃO AQUI: A classe agora implementa OnInit
export class EstatisticaComponent implements OnInit {
  menuAberto = false; // Estado para o menu lateral, se usado

  @ViewChild('produtividadeChart', { static: true }) produtividadeChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('financeiroChart', { static: true }) financeiroChart!: ElementRef<HTMLCanvasElement>;

  usuarioNome: string = 'Carregando...';
  usuarioFoto: string = 'https://placehold.co/40x40/aabbcc/ffffff?text=User';

  totalPropriedades: number = 0;
  areaTotal: number = 0;
  producaoAtual: number = 0;
  culturasAtivas: string[] = [];
  resultadoFinanceiro: number = 0;

  atividades: Atividade[] = [];

  dadosProdutividade: number[] = [];
  culturas: string[] = [];
  meses: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  dadosReceitasMensais: number[] = new Array(12).fill(0);
  dadosDespesasMensais: number[] = new Array(12).fill(0);

  dadosFinanceiros = {
    receitas: 0,
    despesas: 0
  };

  constructor(private apiService: ApiService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.carregarDadosDoBackend();
  }

  carregarDadosDoBackend(): void {
    this.apiService.getAllDashboardData().subscribe({
      next: (data) => {
        const { userProfile, properties, crops, activities, financialRecords } = data;

        if (userProfile) {
          this.usuarioNome = userProfile.username || 'Usuário';
          this.usuarioFoto = userProfile.fotoUrl || 'https://placehold.co/40x40/aabbcc/ffffff?text=User';
        } else {
          this.usuarioNome = 'Visitante';
        }

        this.totalPropriedades = properties.length;
        this.areaTotal = properties.reduce((sum, prop) => sum + prop.area, 0);

        const producaoPorCultura: { [key: string]: number } = {};
        const culturasUnicas = new Set<string>();
        let totalProducao = 0;

        crops.forEach(crop => {
          culturasUnicas.add(crop.name);
          if (crop.actualYield) {
            totalProducao += crop.actualYield;
            producaoPorCultura[crop.name] = (producaoPorCultura[crop.name] || 0) + crop.actualYield;
          }
        });
        this.producaoAtual = totalProducao;
        this.culturasAtivas = Array.from(culturasUnicas);

        let totalReceitas = 0;
        let totalDespesas = 0;

        financialRecords.forEach(record => {
          if (record.type === 'revenue') {
            totalReceitas += record.amount;
          } else if (record.type === 'expense') {
            totalDespesas += record.amount;
          }
        });
        this.resultadoFinanceiro = totalReceitas - totalDespesas;
        this.dadosFinanceiros.receitas = totalReceitas;
        this.dadosFinanceiros.despesas = totalDespesas;

        // CORREÇÃO AQUI: O mapeamento agora usa 'ativ.description'
        this.atividades = activities.map(ativ => ({
          _id: ativ._id, // Garante que _id esteja presente
          description: ativ.description, // Mapeia 'description' do backend
          date: new Date(ativ.date),
          type: ativ.type, // Mapeia 'type' do backend
          icone: this.getIconForActivityType(ativ.type)
        })).sort((a, b) => b.date.getTime() - a.date.getTime());

        this.culturas = Object.keys(producaoPorCultura);
        this.dadosProdutividade = this.culturas.map(cultura => producaoPorCultura[cultura]);

        this.dadosReceitasMensais = new Array(12).fill(0);
        this.dadosDespesasMensais = new Array(12).fill(0);

        financialRecords.forEach(record => {
          const recordDate = new Date(record.date);
          const month = recordDate.getMonth();
          if (month >= 0 && month < 12) {
            if (record.type === 'revenue') {
              this.dadosReceitasMensais[month] += record.amount;
            } else if (record.type === 'expense') {
              this.dadosDespesasMensais[month] += record.amount;
            }
          }
        });

        this.criarGraficos();
      },
      error: (err) => {
        console.error('Erro ao carregar dados do backend:', err);
      }
    });
  }

  getIconForActivityType(type: string): string {
    switch (type.toLowerCase()) {
      case 'planting':
        return 'fa-seedling';
      case 'harvest':
        return 'fa-wheat-awn';
      case 'maintenance':
        return 'fa-tractor';
      case 'payment':
      case 'revenue':
        return 'fa-dollar-sign';
      case 'expense':
        return 'fa-money-bill-wave';
      case 'forecast':
        return 'fa-cloud-rain';
      default:
        return 'fa-clipboard-list';
    }
  }

  criarGraficos(): void {
    if (this.produtividadeChart && this.produtividadeChart.nativeElement) {
      const existingChart = Chart.getChart(this.produtividadeChart.nativeElement);
      if (existingChart) {
        existingChart.destroy();
      }

      new Chart(this.produtividadeChart.nativeElement, {
        type: 'bar',
        data: {
          labels: this.culturas,
          datasets: [{
            label: 'Produção Total (kg)',
            data: this.dadosProdutividade,
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(50, 205, 50, 0.6)'
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 99, 132, 1)', 'rgba(50, 205, 50, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Produção Total (kg)'
              },
              ticks: {
                callback: function(value: any) {
                  return new Intl.NumberFormat('pt-BR').format(value) + ' kg';
                }
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
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('pt-BR').format(context.parsed.y) + ' kg';
                  }
                  return label;
                }
              }
            }
          }
        }
      });
    } else {
      console.error('Elemento canvas #produtividadeChart não encontrado.');
    }

    if (this.financeiroChart && this.financeiroChart.nativeElement) {
      const existingChart = Chart.getChart(this.financeiroChart.nativeElement);
      if (existingChart) {
        existingChart.destroy();
      }

      new Chart(this.financeiroChart.nativeElement, {
        type: 'bar',
        data: {
          labels: this.meses,
          datasets: [
            {
              label: 'Receitas',
              data: this.dadosReceitasMensais,
              backgroundColor: 'rgba(40, 167, 69, 0.6)',
              borderColor: 'rgba(40, 167, 69, 1)',
              borderWidth: 1
            },
            {
              label: 'Despesas',
              data: this.dadosDespesasMensais,
              backgroundColor: 'rgba(220, 53, 69, 0.6)',
              borderColor: 'rgba(220, 53, 69, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Valor (R$)'
              },
              ticks: {
                callback: function(value: any) {
                  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                }
              }
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

  alternarMenu() {
    this.menuAberto = !this.menuAberto;
  }

  @HostListener('document:click', ['$event'])
  fecharMenuFora(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clicouNoBotao = target.closest('.menu-toggle');
    const clicouNoMenu = target.closest('.main-menu');

    if (!clicouNoBotao && !clicouNoMenu) {
      this.menuAberto = false;
    }
  }
}
