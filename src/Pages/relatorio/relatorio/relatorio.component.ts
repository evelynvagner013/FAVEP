import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common'; // Incluir DatePipe
import { FormsModule } from '@angular/forms'; // Incluir FormsModule para ngModel
import { Chart, registerables } from 'chart.js'; // Para criar gráficos

// Importe o ApiService e as interfaces de dados do backend
import { ApiService, UserProfile, Property, Crop, FinancialRecord as BackendFinancialRecord } from '../../../services/api.service';

// Registra a localidade para que os pipes de number, currency, date funcionem corretamente
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
registerLocaleData(localePt);

// Interface local para FinancialRecord, onde 'date' é um objeto Date
interface FinancialRecord extends Omit<BackendFinancialRecord, 'date'> {
  date: Date;
}

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule, // Para pipes e diretivas comuns
    FormsModule // Para [(ngModel)] em formulários
  ],
  providers: [DatePipe], // Forneça DatePipe para injeção
  templateUrl: './relatorio.component.html',
  styleUrl: './relatorio.component.css'
})
export class RelatorioComponent implements OnInit {
  // Propriedades do menu e usuário no cabeçalho
  menuAberto = false;
  usuarioNome: string = 'Carregando...';
  usuarioFoto: string = 'https://placehold.co/40x40/aabbcc/ffffff?text=User'; // Imagem padrão

  // Dados brutos do backend
  properties: Property[] = [];
  crops: Crop[] = [];
  financialRecords: FinancialRecord[] = [];

  // Filtros para o relatório
  selectedPropertyId: string = 'todos'; // ID da propriedade selecionada, 'todos' por padrão
  startDate: string = ''; // Data de início para o filtro de período (string para input type="date")
  endDate: string = '';   // Data de fim para o filtro de período (string para input type="date")
  selectedCropType: string = 'todos'; // Tipo de cultura selecionada para filtro
  reportType: 'productivity' | 'financial' | 'crop_production' = 'productivity'; // Tipo de relatório

  // Opções para os filtros (preenchidas dinamicamente)
  availableCropTypes: { value: string, text: string }[] = [{ value: 'todos', text: 'Todas as Culturas' }];

  // Referência ao canvas do gráfico
  @ViewChild('reportChartCanvas', { static: true }) reportChartCanvas!: ElementRef<HTMLCanvasElement>;
  reportChart: Chart | null = null; // Instância do Chart.js

  constructor(private apiService: ApiService, private datePipe: DatePipe) {
    Chart.register(...registerables); // Registra componentes do Chart.js
  }

  ngOnInit(): void {
    this.loadInitialData(); // Carrega dados iniciais (propriedades, culturas, financeiro)
  }

  /**
   * Carrega os dados iniciais do backend (propriedades, culturas, financeiro).
   */
  loadInitialData(): void {
    this.apiService.getAllDashboardData().subscribe({
      next: (data) => {
        // Atualiza informações do usuário no cabeçalho
        if (data.userProfile) {
          this.usuarioNome = data.userProfile.username || 'Usuário';
          this.usuarioFoto = data.userProfile.fotoUrl || 'https://placehold.co/40x40/aabbcc/ffffff?text=User';
        } else {
          this.usuarioNome = 'Visitante';
        }

        this.properties = data.properties;
        this.crops = data.crops;
        // Converte datas para objetos Date para manipulação no frontend
        this.financialRecords = data.financialRecords.map(rec => ({ ...rec, date: new Date(rec.date) }));

        // Preenche as opções de tipo de cultura para o filtro
        const uniqueCropTypes = new Set<string>();
        this.crops.forEach(crop => uniqueCropTypes.add(crop.name));
        Array.from(uniqueCropTypes).sort().forEach(type => {
          this.availableCropTypes.push({ value: type, text: type });
        });

        // Gera o relatório inicial
        this.generateReport();
      },
      error: (err) => {
        console.error('Erro ao carregar dados iniciais para o relatório:', err);
        // TODO: Exibir mensagem de erro na UI
      }
    });
  }

  /**
   * Gera o relatório com base nos filtros selecionados.
   */
  generateReport(): void {
    // Destrói o gráfico existente antes de criar um novo
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
    let data: number[] = [];
    let chartTitle: string = '';
    let chartType: 'bar' | 'line' | 'pie' = 'bar'; // Tipo de gráfico padrão
    let datasets: any[] = []; // Para múltiplos datasets (ex: receitas e despesas)

    // Filtra os dados brutos com base nos filtros selecionados
    const filteredProperties = this.selectedPropertyId === 'todos'
      ? this.properties
      : this.properties.filter(p => p._id === this.selectedPropertyId);

    const filteredCrops = this.crops.filter(crop => {
      const isPropertyMatch = this.selectedPropertyId === 'todos' || crop.property === this.selectedPropertyId;
      const isCropTypeMatch = this.selectedCropType === 'todos' || crop.name === this.selectedCropType;
      return isPropertyMatch && isCropTypeMatch;
    });

    const filteredFinancialRecords = this.financialRecords.filter(record => {
      const recordDate = record.date;
      const isPropertyMatch = this.selectedPropertyId === 'todos' || record.property === this.selectedPropertyId;
      const isDateRangeMatch = (!this.startDate || recordDate >= new Date(this.startDate)) &&
                               (!this.endDate || recordDate <= new Date(this.endDate));
      return isPropertyMatch && isDateRangeMatch;
    });


    // Lógica para gerar dados do gráfico com base no tipo de relatório
    switch (this.reportType) {
      case 'productivity':
        chartTitle = 'Produtividade por Cultura (kg/ha)';
        chartType = 'bar';
        const productivityData: { [key: string]: { totalYield: number, totalArea: number } } = {};

        filteredCrops.forEach(crop => {
          if (!productivityData[crop.name]) {
            productivityData[crop.name] = { totalYield: 0, totalArea: 0 };
          }
          productivityData[crop.name].totalYield += (crop.actualYield || 0);
          // Soma a área da propriedade associada à cultura para o cálculo da produtividade
          const propArea = this.properties.find(p => p._id === crop.property)?.area || 0;
          productivityData[crop.name].totalArea += propArea;
        });

        labels = Object.keys(productivityData).sort();
        data = labels.map(label => {
          const item = productivityData[label];
          return item.totalArea > 0 ? item.totalYield / item.totalArea : 0;
        });

        datasets = [{
          label: 'Produtividade (kg/ha)',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }];
        break;

      case 'financial':
        chartTitle = 'Resultado Financeiro (R$)';
        chartType = 'bar'; // Pode ser 'bar' ou 'line'
        const totalRevenue = filteredFinancialRecords.filter(r => r.type === 'revenue').reduce((sum, r) => sum + r.amount, 0);
        const totalExpense = filteredFinancialRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
        const netResult = totalRevenue - totalExpense;

        labels = ['Receitas', 'Despesas', 'Resultado'];
        datasets = [{
          label: 'Valor (R$)',
          data: [totalRevenue, totalExpense, netResult],
          backgroundColor: [
            'rgba(40, 167, 69, 0.6)', // Receitas (Verde)
            'rgba(220, 53, 69, 0.6)', // Despesas (Vermelho)
            netResult >= 0 ? 'rgba(0, 123, 255, 0.6)' : 'rgba(255, 193, 7, 0.6)' // Resultado (Azul ou Amarelo)
          ],
          borderColor: [
            'rgba(40, 167, 69, 1)',
            'rgba(220, 53, 69, 1)',
            netResult >= 0 ? 'rgba(0, 123, 255, 1)' : 'rgba(255, 193, 7, 1)'
          ],
          borderWidth: 1
        }];
        break;

      case 'crop_production':
        chartTitle = 'Produção Total por Cultura (kg)';
        chartType = 'bar';
        const cropProductionData: { [key: string]: number } = {};

        filteredCrops.forEach(crop => {
          if (!cropProductionData[crop.name]) {
            cropProductionData[crop.name] = 0;
          }
          cropProductionData[crop.name] += (crop.actualYield || 0);
        });

        labels = Object.keys(cropProductionData).sort();
        data = labels.map(label => cropProductionData[label]);

        datasets = [{
          label: 'Produção (kg)',
          data: data,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
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
          title: {
            display: true,
            text: chartTitle,
            font: { size: 16 }
          },
          legend: {
            display: datasets.length > 1 || (datasets.length === 1 && datasets[0].label !== chartTitle) // Exibe legenda se houver múltiplos datasets ou o label for diferente do título
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.getAxisYTitle(this.reportType)
            },
            ticks: {
              callback: function(value: any) {
                if (this.reportType === 'financial') {
                  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                }
                return new Intl.NumberFormat('pt-BR').format(value);
              }.bind(this) // Garante que 'this' dentro do callback se refira ao componente
            }
          },
          x: {
            title: {
              display: true,
              text: this.getAxisXTitle(this.reportType)
            }
          }
        }
      }
    });
  }

  /**
   * Retorna o título do eixo Y com base no tipo de relatório.
   */
  getAxisYTitle(reportType: string): string {
    switch (reportType) {
      case 'productivity': return 'Produtividade (kg/ha)';
      case 'financial': return 'Valor (R$)';
      case 'crop_production': return 'Produção (kg)';
      default: return 'Valor';
    }
  }

  /**
   * Retorna o título do eixo X com base no tipo de relatório.
   */
  getAxisXTitle(reportType: string): string {
    switch (reportType) {
      case 'productivity': return 'Culturas';
      case 'financial': return 'Categorias';
      case 'crop_production': return 'Culturas';
      default: return '';
    }
  }

  // Métodos do menu (mantidos do seu código original)
  alternarMenu() {
    this.menuAberto = !this.menuAberto;
  }

  @HostListener('document:click', ['$event'])
  fecharMenuFora(event: MouseEvent) {
    const alvo = event.target as HTMLElement;
    const clicouNoBotao = alvo.closest('.menu-toggle');
    const clicouNoMenu = alvo.closest('.main-menu');

    if (!clicouNoBotao && !clicouNoMenu) {
      this.menuAberto = false;
    }
  }
}
