import { Component, OnInit, ViewChild, ElementRef, HostListener, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../navbar/menu/menu.component';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ApiService } from '../../services/api.service';

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
    CommonModule,
    RouterLink,
    MenuComponent,
  ],
  templateUrl: './estatistica.component.html',
  styleUrls: ['./estatistica.component.css']
})
export class EstatisticaComponent implements OnInit {
  // Propriedade para controlar o tema (pública para o HTML)
  public contentTheme: 'light' | 'dark' = 'light';
  
  menuAberto = false;

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

  dadosProdutividade: number[] = [6500, 5900, 8000, 4500];
  culturas: string[] = ['Soja', 'Milho', 'Algodão', 'Trigo'];

  meses: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  dadosReceitasMensais: number[] = [15000, 16000, 17000, 15500, 18000, 19000, 20000, 21000, 19500, 22000, 23000, 24000];
  dadosDespesasMensais: number[] = [8000, 8500, 9000, 8800, 9500, 10000, 10500, 11000, 10200, 11500, 12000, 12500];

  dadosFinanceiros = {
    receitas: 300000,
    despesas: 175000
  };

  constructor(
    private apiService: ApiService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    const user = this.apiService.getUser();
    if (user) {
      this.usuarioNome = user.nome;
      this.usuarioFoto = user.fotoUrl || 'assets/user-avatar.jpg';
    }
    this.criarGraficos();

    // Carrega e aplica o tema ao inicializar
    this.contentTheme = localStorage.getItem('contentTheme') as 'light' | 'dark' || 'light';
    this.applyContentTheme();
  }

  // --- MÉTODOS DE CONTROLE DO TEMA ---
  toggleTheme(): void {
    this.contentTheme = this.contentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('contentTheme', this.contentTheme);
    this.applyContentTheme();
  }

  private applyContentTheme(): void {
    const container = this.document.getElementById('dashboard-container');
    if (container) {
      if (this.contentTheme === 'dark') {
        this.renderer.addClass(container, 'content-dark-theme');
      } else {
        this.renderer.removeClass(container, 'content-dark-theme');
      }
    }
  }
  
  // --- SEUS MÉTODOS ORIGINAIS ---
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
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'kg/ha' }
            },
            x: {
              title: { display: true, text: 'Culturas' }
            }
          },
          plugins: {
            legend: { position: 'top' },
            tooltip: { mode: 'index', intersect: false }
          }
        }
      });
    } else {
      console.error('Elemento canvas #produtividadeChart não encontrado.');
    }

    // Financial Chart
    if (this.financeiroChart && this.financeiroChart.nativeElement) {
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
              title: { display: true, text: 'Valor (R$)' }
            },
            x: {
              title: { display: true, text: 'Mês' }
            }
          },
          plugins: {
            legend: { display: true, position: 'top' },
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