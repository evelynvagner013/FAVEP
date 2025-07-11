import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

// --- Imports Corrigidos ---
import { DashboardDataService } from '../../../services/dashboard-data.service';
import { Usuario, Propriedade, Producao, Movimentacao } from '../../../models/api.models';

registerLocaleData(localePt);

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule
  ],
  providers: [DatePipe],
  templateUrl: './relatorio.component.html',
  styleUrl: './relatorio.component.css'
})
export class RelatorioComponent implements OnInit {

  menuAberto = false;
  usuarioNome: string = '';
  usuarioFoto: string = 'https://placehold.co/40x40/aabbcc/ffffff?text=User';

  // Arrays de dados
  propriedades: Propriedade[] = [];
  producoes: Producao[] = [];
  movimentacoes: Movimentacao[] = [];

  // Filtros do relatório
  selectedPropertyId: string = 'todos';
  startDate: string = '';
  endDate: string = '';
  selectedCropType: string = 'todos';
  reportType: 'productivity' | 'financial' | 'crop_production' = 'productivity';

  availableCropTypes: { value: string, text: string }[] = [{ value: 'todos', text: 'Todas as Culturas' }];

  // Referência ao canvas do gráfico
  @ViewChild('reportChartCanvas', { static: true }) reportChartCanvas!: ElementRef<HTMLCanvasElement>;
  reportChart: Chart | null = null;

  // --- Construtor Corrigido ---
  constructor(
    private dashboardDataService: DashboardDataService,
    private datePipe: DatePipe
  ) {
    Chart.register(...registerables);
  }

  // --- ngOnInit Corrigido ---
  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  // --- Carregamento de Dados Corrigido ---
  carregarDadosIniciais(): void {
    this.dashboardDataService.carregarDadosDashboard().subscribe({
      next: (data) => {
        const { perfil, propriedades, producoes, movimentacoes } = data;

        if (perfil) {
          this.usuarioNome = perfil.nome;
          this.usuarioFoto = perfil.fotoPerfil || 'https://placehold.co/40x40/aabbcc/ffffff?text=User';
        }

        this.propriedades = propriedades;
        this.producoes = producoes;
        this.movimentacoes = movimentacoes.map(rec => ({ ...rec, data: new Date(rec.data) }));

        const uniqueCropTypes = new Set<string>(this.producoes.map(prod => prod.cultura));
        this.availableCropTypes = [{ value: 'todos', text: 'Todas as Culturas' }];
        Array.from(uniqueCropTypes).sort().forEach(type => {
          this.availableCropTypes.push({ value: type, text: type });
        });

        this.gerarRelatorio();
      },
      error: (err) => {
        console.error('Erro ao carregar dados iniciais para o relatório:', err);
      }
    });
  }

 gerarRelatorio(): void {
  if (this.reportChart) {
    this.reportChart.destroy();
    this.reportChart = null;
  }

  const ctx = this.reportChartCanvas.nativeElement.getContext('2d');
  if (!ctx) {
    console.error('Contexto 2D do canvas não pôde ser obtido!');
    return;
  }

  let labels: string[] = [];
  let datasets: any[] = [];
  let chartTitle: string = '';
  let chartType: 'bar' | 'line' | 'pie' = 'bar'; // O tipo inicial continua sendo 'bar'

  // A lógica de filtragem permanece a mesma
  const filteredProducoes = this.producoes.filter(prod => {
    const isPropertyMatch = this.selectedPropertyId === 'todos' || String(prod.propriedadeId) === this.selectedPropertyId;
    const isCropTypeMatch = this.selectedCropType === 'todos' || prod.cultura === this.selectedCropType;
    const isDateRangeMatch = (!this.startDate || new Date(prod.data) >= new Date(this.startDate)) &&
                             (!this.endDate || new Date(prod.data) <= new Date(this.endDate));
    return isPropertyMatch && isCropTypeMatch && isDateRangeMatch;
  });

  const filteredMovimentacoes = this.movimentacoes.filter(mov => {
    const isPropertyMatch = this.selectedPropertyId === 'todos' || mov.propriedade === this.selectedPropertyId;
    const isDateRangeMatch = (!this.startDate || mov.data >= new Date(this.startDate)) &&
                             (!this.endDate || mov.data <= new Date(this.endDate));
    return isPropertyMatch && isDateRangeMatch;
  });

  switch (this.reportType) {
    case 'productivity':
      chartTitle = 'Produtividade por Cultura (kg/ha)';
      chartType = 'bar';
      const productivityData: { [key: string]: { totalYield: number, totalArea: number } } = {};
      filteredProducoes.forEach(prod => {
        if (!productivityData[prod.cultura]) {
          productivityData[prod.cultura] = { totalYield: 0, totalArea: 0 };
        }
        productivityData[prod.cultura].totalYield += (prod.quantidade || 0);
        const propArea = this.propriedades.find(p => p.id === String(prod.propriedadeId))?.area || 0;
        productivityData[prod.cultura].totalArea += propArea;
      });
      labels = Object.keys(productivityData).sort();
      const productivityValues = labels.map(label => {
        const item = productivityData[label];
        return item.totalArea > 0 ? item.totalYield / item.totalArea : 0;
      });
      datasets = [{
        label: 'Produtividade (kg/ha)',
        data: productivityValues,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }];
      break;

    case 'financial':
      // --- MUDANÇA PRINCIPAL AQUI ---
      chartTitle = 'Composição Financeira';
      chartType = 'pie'; // Alterado para 'pie' para tornar a condição útil

      const totalRevenue = filteredMovimentacoes.filter(r => r.tipo === 'receita').reduce((sum, r) => sum + r.valor, 0);
      const totalExpense = filteredMovimentacoes.filter(r => r.tipo === 'despesa').reduce((sum, r) => sum + r.valor, 0);

      // Em um gráfico de pizza, os 'labels' são as categorias
      labels = ['Receitas', 'Despesas'];
      
      // E o 'dataset' contém os valores correspondentes
      datasets = [{
        label: 'Valor (R$)',
        data: [totalRevenue, totalExpense],
        backgroundColor: [
          'rgba(40, 167, 69, 0.7)',  // Verde para Receitas
          'rgba(220, 53, 69, 0.7)'   // Vermelho para Despesas
        ],
        borderColor: [
          'rgba(40, 167, 69, 1)',
          'rgba(220, 53, 69, 1)'
        ],
        borderWidth: 1
      }];
      break;

    case 'crop_production':
      chartTitle = 'Produção Total por Cultura (kg)';
      chartType = 'bar';
      const cropProductionData: { [key: string]: number } = {};
      filteredProducoes.forEach(prod => {
        if (!cropProductionData[prod.cultura]) {
          cropProductionData[prod.cultura] = 0;
        }
        cropProductionData[prod.cultura] += (prod.quantidade || 0);
      });
      labels = Object.keys(cropProductionData).sort();
      const productionValues = labels.map(label => cropProductionData[label]);
      datasets = [{
        label: 'Produção (kg)',
        data: productionValues,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      }];
      break;
  }

  // Cria o novo gráfico
  this.reportChart = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: chartTitle, font: { size: 16 } },
        // Agora esta condição é útil, pois chartType PODE ser 'pie'
        legend: {
          display: datasets.length > 1 || chartType === 'pie',
          position: 'top',
        }
      },
      // Removemos a configuração dos eixos para gráficos de pizza, pois eles não os possuem
      scales: chartType !== 'pie' ? {
        y: {
          beginAtZero: true,
          title: { display: true, text: this.getAxisYTitle(this.reportType) },
          ticks: {
            callback: (value: any) => {
              if (this.reportType === 'financial') {
                return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
              }
              return new Intl.NumberFormat('pt-BR').format(value);
            }
          }
        },
        x: {
          title: { display: true, text: this.getAxisXTitle(this.reportType) }
        }
      } : {} // Objeto vazio para remover eixos no gráfico de pizza
    }
  });
}

  getAxisYTitle(reportType: string): string {
    const titles: { [key: string]: string } = {
      productivity: 'Produtividade (kg/ha)',
      financial: 'Valor (R$)',
      crop_production: 'Produção (kg)'
    };
    return titles[reportType] || 'Valor';
  }

  getAxisXTitle(reportType: string): string {
    const titles: { [key:string]: string } = {
      productivity: 'Culturas',
      financial: 'Categorias',
      crop_production: 'Culturas'
    };
    return titles[reportType] || '';
  }

  alternarMenu() {
    this.menuAberto = !this.menuAberto;
  }

  @HostListener('document:click', ['$event'])
  fecharMenuFora(event: MouseEvent) {
    const alvo = event.target as HTMLElement;
    if (!alvo.closest('.menu-toggle') && !alvo.closest('.main-menu')) {
      this.menuAberto = false;
    }
  }
}