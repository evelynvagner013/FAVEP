import { Component, HostListener, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { MenuComponent } from '../navbar/menu/menu.component';
import { ApiService } from '../../services/api.service';

// Definição das interfaces
export interface Propriedade {
  id: number;
  nome: string;
  area: number;
  localizacao: string;
  produtividade: number;
  culturas: string[];
  ativo: boolean;
}

export interface Producao {
  id: number;
  propriedadeId: number;
  cultura: string;
  safra: string;
  quantidade: number;
  area: number;
  data: Date;
}

export interface Movimentacao {
  id: number;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: Date;
  propriedade?: string;
  categoria?: string;
}

@Component({
  selector: 'app-gerenciamento',
  standalone: true,
  imports: [MenuComponent, RouterModule, CommonModule, FormsModule],
  templateUrl: './gerenciamento.component.html',
  styleUrl: './gerenciamento.component.css'
})
export class GerenciamentoComponent implements OnInit {

  // Propriedade para controlar o estado do tema (pública para o template)
  public contentTheme: 'light' | 'dark' = 'light';

  // Suas propriedades existentes
  menuAberto = false;
  usuarioNome: string = '';
  headerUsuarioFoto: string = '';
  abaAtiva: string = 'propriedades';
  modalAberto: boolean = false;
  confirmacaoAberta: boolean = false;
  configAberto: boolean = false;
  modalTitulo: string = '';
  mensagemConfirmacao: string = '';
  tipoEdicao: string = '';
  itemParaExcluir: any = null;
  tipoExclusao: string = '';
  filtroAtivo: string = 'todos';
  filtroPeriodo: string = '30';
  termoBusca: string = '';
  tipoRelatorio: string = 'produtividade';
  periodoRelatorio: string = '30';

  opcoesFiltro: any[] = [
    { valor: 'todos', texto: 'Todos' },
    { valor: 'Soja', texto: 'Soja' },
    { valor: 'Milho', texto: 'Milho' },
    { valor: 'Algodão', texto: 'Algodão' }
  ];

  usuario: any = {};
  novaSenha: string = '';

  propriedades: Propriedade[] = [
    { id: 1, nome: 'Fazenda São Francisco', area: 4000, localizacao: 'Casa do Chapéu, BA', produtividade: 70.5, culturas: ['Soja', 'Milho', 'Algodão'], ativo: true },
    { id: 2, nome: 'Sítio Vale Verde', area: 250, localizacao: 'Barreiras, BA', produtividade: 65.2, culturas: ['Milho', 'Feijão'], ativo: false },
    { id: 3, nome: 'Chácara Bela Vista', area: 100, localizacao: 'Luís Eduardo Magalhães, BA', produtividade: 60.0, culturas: ['Soja'], ativo: true }
  ];
  propriedadesFiltradas: Propriedade[] = [];
  propriedadeEditada: Partial<Propriedade> & { culturas: string[] } = { culturas: [], ativo: true };

  producoes: Producao[] = [
    { id: 1, propriedadeId: 1, cultura: 'Soja', safra: '2022/23', quantidade: 269319, area: 1500, data: new Date('2023-05-15') },
    { id: 2, propriedadeId: 1, cultura: 'Milho', safra: '2022/23', quantidade: 180000, area: 1000, data: new Date('2023-06-20') }
  ];
  producoesFiltradas: Producao[] = [];
  producaoEditada: Partial<Producao> = {};

  movimentacoes: Movimentacao[] = [
    { id: 1, tipo: 'receita', descricao: 'Venda de Soja', valor: 125000, data: new Date('2023-05-15'), propriedade: 'Fazenda São Francisco' },
    { id: 2, tipo: 'despesa', descricao: 'Compra de Fertilizantes', valor: 28000.50, data: new Date('2023-05-10'), propriedade: 'Fazenda São Francisco', categoria: 'Insumos' }
  ];
  movimentacoesFiltradas: Movimentacao[] = [];
  movimentacaoEditada: Partial<Movimentacao> = { tipo: 'receita' };

  todasCulturas: string[] = ['Soja', 'Milho', 'Algodão', 'Feijão', 'Trigo', 'Café'];
  safras: string[] = ['2022/23', '2021/22', '2020/21'];

  relatorioChart: any;

  // CONSTRUCTOR CORRIGIDO com todas as injeções necessárias
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
      this.usuario = user;
      this.usuarioNome = this.usuario.nome;
      this.headerUsuarioFoto = this.usuario.fotoUrl || 'assets/user-avatar.jpg';
    }
    this.aplicarFiltros();

    // Lógica do tema é carregada na inicialização
    this.contentTheme = localStorage.getItem('contentTheme') as 'light' | 'dark' || 'light';
    this.applyContentTheme();
  }

  // MÉTODOS PARA O TEMA
  toggleTheme(): void {
    this.contentTheme = this.contentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('contentTheme', this.contentTheme);
    this.applyContentTheme();
  }

  private applyContentTheme(): void {
    const container = this.document.getElementById('dashboard-container');
    if (!container) {
      console.error('Container do dashboard não encontrado no DOM.');
      return;
    }

    if (this.contentTheme === 'dark') {
      this.renderer.addClass(container, 'content-dark-theme');
    } else {
      this.renderer.removeClass(container, 'content-dark-theme');
    }
  }

  // SEUS MÉTODOS ORIGINAIS
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

  selecionarAba(aba: string): void {
    this.abaAtiva = aba;
    this.aplicarFiltros();
  }

  abrirModalAdicionar(): void {
    this.modalAberto = true;
    this.tipoEdicao = this.abaAtiva === 'financeiro' ? 'movimentacao' :
                      (this.abaAtiva === 'propriedades' ? 'propriedade' : this.abaAtiva);
    this.modalTitulo = `Adicionar ${this.getTituloModal()}`;

    switch (this.tipoEdicao) {
      case 'propriedade':
        this.propriedadeEditada = { culturas: [], ativo: true };
        break;
      case 'producao':
        this.producaoEditada = { data: new Date() };
        break;
      case 'movimentacao':
        this.movimentacaoEditada = {
          tipo: 'receita',
          data: new Date(),
          propriedade: this.propriedades.length > 0 ? this.propriedades[0].nome : ''
        };
        break;
    }
  }

  getTituloModal(): string {
    switch (this.tipoEdicao) {
      case 'propriedade': return 'Propriedade';
      case 'producao': return 'Produção';
      case 'movimentacao': return 'Movimentação Financeira';
      default: return 'Item';
    }
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.propriedadeEditada = { culturas: [], ativo: true };
    this.producaoEditada = {};
    this.movimentacaoEditada = { tipo: 'receita' };
  }

  aplicarFiltros(): void {
    switch (this.abaAtiva) {
      case 'propriedades':
        this.filtrarPropriedades();
        break;
      case 'producao':
        this.filtrarProducoes();
        break;
      case 'financeiro':
        this.filtrarMovimentacoes();
        break;
    }
  }

  filtrarPropriedades(): void {
    this.propriedadesFiltradas = this.propriedades.filter(prop => {
      const filtroCultura = this.filtroAtivo === 'todos' || prop.culturas.includes(this.filtroAtivo);
      const busca = !this.termoBusca ||
        prop.nome.toLowerCase().includes(this.termoBusca.toLowerCase()) ||
        prop.localizacao.toLowerCase().includes(this.termoBusca.toLowerCase());
      return filtroCultura && busca;
    });
  }

  filtrarProducoes(): void {
    this.producoesFiltradas = this.producoes.filter(prod => {
      const filtroCultura = this.filtroAtivo === 'todos' || prod.cultura === this.filtroAtivo;
      const busca = !this.termoBusca ||
        this.getNomePropriedade(prod.propriedadeId).toLowerCase().includes(this.termoBusca.toLowerCase()) ||
        prod.cultura.toLowerCase().includes(this.termoBusca.toLowerCase());
      return filtroCultura && busca;
    });
  }

  filtrarMovimentacoes(): void {
    const dias = parseInt(this.filtroPeriodo);
    const dataLimite = new Date();
    if (!isNaN(dias)) {
        dataLimite.setDate(dataLimite.getDate() - dias);
    }

    this.movimentacoesFiltradas = this.movimentacoes.filter(mov => {
      const periodo = this.filtroPeriodo === 'todos' || (mov.data instanceof Date && mov.data >= dataLimite);
      const busca = !this.termoBusca ||
        mov.descricao.toLowerCase().includes(this.termoBusca.toLowerCase()) ||
        (mov.propriedade && mov.propriedade.toLowerCase().includes(this.termoBusca.toLowerCase()));
      return periodo && busca;
    });
  }

  getNomePropriedade(id: number): string {
    const prop = this.propriedades.find(p => p.id === id);
    return prop ? prop.nome : 'Desconhecida';
  }

  calcularAreaTotal(): number {
    return this.propriedades
      .filter(prop => prop.ativo)
      .reduce((total, prop) => total + prop.area, 0);
  }

  contarCulturasAtivas(): number {
    const culturasUnicas = new Set<string>();
    this.propriedades.forEach(prop => {
      if (prop.ativo) {
        prop.culturas.forEach(c => culturasUnicas.add(c));
      }
    });
    return culturasUnicas.size;
  }

  calcularProducaoTotal(): number {
    return this.producoes.reduce((total, prod) => total + prod.quantidade, 0);
  }

  calcularAreaPlantada(): number {
    return this.producoes.reduce((total, prod) => total + prod.area, 0);
  }

  calcularProdutividadeMedia(): number {
    const totalProducao = this.calcularProducaoTotal();
    const totalArea = this.calcularAreaPlantada();
    return totalArea > 0 ? totalProducao / totalArea : 0;
  }

  calcularTotalReceitas(): number {
    return this.movimentacoes
      .filter(m => m.tipo === 'receita')
      .reduce((total, m) => total + m.valor, 0);
  }

  calcularTotalDespesas(): number {
    return this.movimentacoes
      .filter(m => m.tipo === 'despesa')
      .reduce((total, m) => total + m.valor, 0);
  }

  calcularResultadoFinanceiro(): number {
    return this.calcularTotalReceitas() - this.calcularTotalDespesas();
  }

  editarPropriedade(prop: Propriedade): void {
    this.propriedadeEditada = { ...prop };
    this.modalTitulo = 'Editar Propriedade';
    this.tipoEdicao = 'propriedade';
    this.modalAberto = true;
  }

  editarProducao(prod: Producao): void {
    this.producaoEditada = { ...prod, data: new Date(prod.data) };
    this.modalTitulo = 'Editar Produção';
    this.tipoEdicao = 'producao';
    this.modalAberto = true;
  }

  editarMovimentacao(mov: Movimentacao): void {
    this.movimentacaoEditada = { ...mov, data: new Date(mov.data) };
    this.modalTitulo = 'Editar Movimentação';
    this.tipoEdicao = 'movimentacao';
    this.modalAberto = true;
  }

  confirmarExclusao(item: any, tipo: string): void {
    this.itemParaExcluir = item;
    this.tipoExclusao = tipo;
    this.mensagemConfirmacao = `Confirmar exclusão de "${tipo === 'propriedade' ? item.nome : (item.descricao || item.cultura)}"?`;
    this.confirmacaoAberta = true;
  }

  cancelarExclusao(): void {
    this.confirmacaoAberta = false;
    this.itemParaExcluir = null;
    this.tipoExclusao = '';
  }

  executarExclusao(): void {
    if (!this.itemParaExcluir) return;

    switch (this.tipoExclusao) {
      case 'propriedade':
        this.propriedades = this.propriedades.filter(p => p.id !== this.itemParaExcluir.id);
        this.producoes = this.producoes.filter(p => p.propriedadeId !== this.itemParaExcluir.id);
        this.movimentacoes = this.movimentacoes.map(m => {
            if (m.propriedade === this.itemParaExcluir.nome) {
                return { ...m, propriedade: undefined };
            }
            return m;
        });
        break;
      case 'producao':
        this.producoes = this.producoes.filter(p => p.id !== this.itemParaExcluir.id);
        break;
      case 'movimentacao':
        this.movimentacoes = this.movimentacoes.filter(m => m.id !== this.itemParaExcluir.id);
        break;
    }

    this.confirmacaoAberta = false;
    this.itemParaExcluir = null;
    this.tipoExclusao = '';
    this.aplicarFiltros();
  }

  gerarNovoId(lista: any[]): number {
    if (!lista || lista.length === 0) return 1;
    const ids = lista.map(item => item.id).filter(id => typeof id === 'number');
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }

  salvar(): void {
    switch (this.tipoEdicao) {
      case 'propriedade':
        this.salvarPropriedade();
        break;
      case 'producao':
        this.salvarProducao();
        break;
      case 'movimentacao':
        this.salvarMovimentacao();
        break;
    }
  }

  salvarPropriedade(): void {
    const propriedadeParaSalvar: Propriedade = {
        id: this.propriedadeEditada.id!,
        nome: this.propriedadeEditada.nome!,
        area: Number(this.propriedadeEditada.area) || 0,
        localizacao: this.propriedadeEditada.localizacao!,
        produtividade: Number(this.propriedadeEditada.produtividade) || 0,
        culturas: this.propriedadeEditada.culturas || [],
        ativo: this.propriedadeEditada.ativo === undefined ? true : this.propriedadeEditada.ativo
    };

    if (propriedadeParaSalvar.id) {
      const index = this.propriedades.findIndex(p => p.id === propriedadeParaSalvar.id);
      if (index !== -1) {
        this.propriedades[index] = propriedadeParaSalvar;
      }
    } else {
      propriedadeParaSalvar.id = this.gerarNovoId(this.propriedades);
      this.propriedades.push(propriedadeParaSalvar);
    }
    this.fecharModal();
    this.aplicarFiltros();
  }

  salvarProducao(): void {
    const producaoParaSalvar: Producao = {
        id: this.producaoEditada.id!,
        propriedadeId: Number(this.producaoEditada.propriedadeId),
        cultura: this.producaoEditada.cultura!,
        safra: this.producaoEditada.safra!,
        quantidade: Number(this.producaoEditada.quantidade) || 0,
        area: Number(this.producaoEditada.area) || 0,
        data: this.producaoEditada.data ? new Date(this.producaoEditada.data) : new Date()
    };

    if (producaoParaSalvar.id) {
      const index = this.producoes.findIndex(p => p.id === producaoParaSalvar.id);
      if (index !== -1) {
        this.producoes[index] = producaoParaSalvar;
      }
    } else {
      producaoParaSalvar.id = this.gerarNovoId(this.producoes);
      this.producoes.push(producaoParaSalvar);
    }
    this.fecharModal();
    this.aplicarFiltros();
  }

  salvarMovimentacao(): void {
    const movimentacaoParaSalvar: Movimentacao = {
        id: this.movimentacaoEditada.id!,
        tipo: this.movimentacaoEditada.tipo === 'despesa' ? 'despesa' : 'receita',
        descricao: this.movimentacaoEditada.descricao!,
        valor: Number(this.movimentacaoEditada.valor) || 0,
        data: this.movimentacaoEditada.data ? new Date(this.movimentacaoEditada.data) : new Date(),
        propriedade: this.movimentacaoEditada.propriedade,
        categoria: this.movimentacaoEditada.categoria
    };

    if (movimentacaoParaSalvar.id) {
      const index = this.movimentacoes.findIndex(m => m.id === movimentacaoParaSalvar.id);
      if (index !== -1) {
        this.movimentacoes[index] = movimentacaoParaSalvar;
      }
    } else {
      movimentacaoParaSalvar.id = this.gerarNovoId(this.movimentacoes);
      this.movimentacoes.push(movimentacaoParaSalvar);
    }
    this.fecharModal();
    this.aplicarFiltros();
  }

  gerarRelatorio(): void {
    if (this.relatorioChart) {
      this.relatorioChart.destroy();
    }

    const canvasElement = document.getElementById('reportChart') as HTMLCanvasElement | null;
    if (!canvasElement) {
        console.error('Elemento canvas do gráfico não encontrado!');
        return;
    }
    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
        console.error('Contexto 2D do canvas não pôde ser obtido!');
        return;
    }

    let labels: string[] = [];
    let data: number[] = [];
    let chartTitle = '';

    switch (this.tipoRelatorio) {
      case 'produtividade':
        chartTitle = 'Produtividade Média por Cultura (kg/ha)';
        const produtividadePorCultura: { [key: string]: { totalProducao: number, totalArea: number, count: number } } = {};
        this.producoes.forEach(p => {
            if (!produtividadePorCultura[p.cultura]) {
                produtividadePorCultura[p.cultura] = { totalProducao: 0, totalArea: 0, count: 0 };
            }
            produtividadePorCultura[p.cultura].totalProducao += p.quantidade;
            produtividadePorCultura[p.cultura].totalArea += p.area;
            produtividadePorCultura[p.cultura].count++;
        });
        labels = Object.keys(produtividadePorCultura);
        data = labels.map(cultura => {
            const p = produtividadePorCultura[cultura];
            return p.totalArea > 0 ? p.totalProducao / p.totalArea : 0;
        });
        break;

      case 'financeiro':
        chartTitle = 'Resultado Financeiro (R$)';
        labels = ['Receitas', 'Despesas', 'Resultado'];
        data = [
          this.calcularTotalReceitas(),
          this.calcularTotalDespesas(),
          this.calcularResultadoFinanceiro()
        ];
        break;

      case 'producao':
        chartTitle = 'Produção Total por Safra (kg)';
        const producaoPorSafra: { [key: string]: number } = {};
        this.producoes.forEach(p => {
            if (!producaoPorSafra[p.safra]) {
                producaoPorSafra[p.safra] = 0;
            }
            producaoPorSafra[p.safra] += p.quantidade;
        });
        labels = Object.keys(producaoPorSafra).sort();
        data = labels.map(safra => producaoPorSafra[safra]);
        break;
    }

    this.relatorioChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: chartTitle,
          data: data,
          backgroundColor: this.tipoRelatorio === 'financeiro' ?
            ['#4CAF50', '#F44336', (this.calcularResultadoFinanceiro() >= 0 ? '#2196F3' : '#FF9800')] :
            '#4CAF50',
          borderColor: this.tipoRelatorio === 'financeiro' ?
            ['#388E3C', '#D32F2F', (this.calcularResultadoFinanceiro() >= 0 ? '#1976D2' : '#F57C00')] :
            '#388E3C',
          borderWidth: 1
        }]
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
                display: this.tipoRelatorio !== 'financeiro' && this.tipoRelatorio !== 'produtividade' && this.tipoRelatorio !== 'producao'
            }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
                display: true,
                text: this.tipoRelatorio === 'financeiro' ? 'Valor (R$)' :
                     (this.tipoRelatorio === 'produtividade' ? 'Produtividade (kg/ha)' : 'Produção (kg)')
            }
          },
          x: {
            title: {
                display: true,
                text: this.tipoRelatorio === 'produtividade' ? 'Culturas' :
                     (this.tipoRelatorio === 'producao' ? 'Safras' : '')
            }
          }
        }
      }
    });
  }

  toggleStatusPropriedade(propriedade: Propriedade): void {
    propriedade.ativo = !propriedade.ativo;
    console.log(`Propriedade '${propriedade.nome}' agora está ${propriedade.ativo ? 'ATIVA' : 'INATIVA'}.`);
  }
}