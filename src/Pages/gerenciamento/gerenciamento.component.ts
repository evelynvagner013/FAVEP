import { Component, OnInit } from '@angular/core';

import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { MenuComponent } from '../navbar/menu/menu.component';

@Component({
  selector: 'app-gerenciamento',
  standalone: true,
  imports: [MenuComponent, RouterLink, CommonModule, FormsModule],
  templateUrl: './gerenciamento.component.html',
  styleUrl: './gerenciamento.component.css'
})
export class GerenciamentoComponent implements OnInit {

  usuarioNome: string = 'João Agricultor';
  usuarioFoto: string = 'assets/user-avatar.jpg';

  
  // Controle de interface
  abaAtiva: string = 'propriedades';
  modalAberto: boolean = false;
  confirmacaoAberta: boolean = false;
  configAberto: boolean = false;
  modalTitulo: string = '';
  mensagemConfirmacao: string = '';
  tipoEdicao: string = '';
  itemParaExcluir: any = null;
  tipoExclusao: string = '';

  // Filtros
  filtroAtivo: string = 'todos';
  filtroPeriodo: string = '30';
  termoBusca: string = '';
  tipoRelatorio: string = 'produtividade';
  periodoRelatorio: string = '30';

  // Opções de filtro
  opcoesFiltro: any[] = [
    { valor: 'todos', texto: 'Todos' },
    { valor: 'Soja', texto: 'Soja' },
    { valor: 'Milho', texto: 'Milho' },
    { valor: 'Algodão', texto: 'Algodão' }
  ];

  // Dados do usuário
  usuario: any = {
    nome: 'João Agricultor',
    email: 'joao@fazenda.com',
    foto: 'assets/user-avatar.jpg'
  };
  novaSenha: string = '';

  // Dados das propriedades
  propriedades: any[] = [
    {
      id: 1,
      nome: 'Fazenda São Francisco',
      area: 4000,
      localizacao: 'Casa do Chapéu, BA',
      produtividade: 70.5,
      culturas: ['Soja', 'Milho', 'Algodão']
    },
    {
      id: 2,
      nome: 'Sítio Vale Verde',
      area: 250,
      localizacao: 'Barreiras, BA',
      produtividade: 65.2,
      culturas: ['Milho', 'Feijão']
    }
  ];
  propriedadesFiltradas: any[] = [];
  propriedadeEditada: any = { culturas: [] };

  // Dados de produção
  producoes: any[] = [
    {
      id: 1,
      propriedadeId: 1,
      cultura: 'Soja',
      safra: '2022/23',
      quantidade: 269319,
      area: 1500,
      data: new Date('2023-05-15')
    },
    {
      id: 2,
      propriedadeId: 1,
      cultura: 'Milho',
      safra: '2022/23',
      quantidade: 180000,
      area: 1000,
      data: new Date('2023-06-20')
    }
  ];
  producoesFiltradas: any[] = [];
  producaoEditada: any = {};

  // Dados financeiros
  movimentacoes: any[] = [
    {
      id: 1,
      tipo: 'receita',
      descricao: 'Venda de Soja',
      valor: 125000,
      data: new Date('2023-05-15'),
      propriedade: 'Fazenda São Francisco'
    },
    {
      id: 2,
      tipo: 'despesa',
      descricao: 'Compra de Fertilizantes',
      valor: 28000.50,
      data: new Date('2023-05-10'),
      propriedade: 'Fazenda São Francisco',
      categoria: 'Insumos'
    }
  ];
  movimentacoesFiltradas: any[] = [];
  movimentacaoEditada: any = { tipo: 'receita' };

  // Listas auxiliares
  todasCulturas: string[] = ['Soja', 'Milho', 'Algodão', 'Feijão', 'Trigo', 'Café'];
  safras: string[] = ['2022/23', '2021/22', '2020/21'];

  // Gráfico
  relatorioChart: any;

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.aplicarFiltros();
  }

  // Controles de interface
  selecionarAba(aba: string): void {
    this.abaAtiva = aba;
    this.aplicarFiltros();
  }

  abrirModalAdicionar(): void {
    this.modalAberto = true;
    this.tipoEdicao = this.abaAtiva === 'financeiro' ? 'movimentacao' : this.abaAtiva;
    this.modalTitulo = `Adicionar ${this.getTituloModal()}`;
    
    switch (this.tipoEdicao) {
      case 'propriedade':
        this.propriedadeEditada = { culturas: [] };
        break;
      case 'producao':
        this.producaoEditada = { data: new Date() };
        break;
      case 'movimentacao':
        this.movimentacaoEditada = { 
          tipo: 'receita', 
          data: new Date(),
          propriedade: this.propriedades[0]?.nome || ''
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
    this.propriedadeEditada = { culturas: [] };
    this.producaoEditada = {};
    this.movimentacaoEditada = { tipo: 'receita' };
  }

  abrirConfiguracoes(): void {
    this.configAberto = true;
  }

  fecharConfig(): void {
    this.configAberto = false;
    this.novaSenha = '';
  }

  // Filtros e busca
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
      const filtro = this.filtroAtivo === 'todos' || prop.culturas.includes(this.filtroAtivo);
      const busca = !this.termoBusca || 
        prop.nome.toLowerCase().includes(this.termoBusca.toLowerCase()) || 
        prop.localizacao.toLowerCase().includes(this.termoBusca.toLowerCase());
      return filtro && busca;
    });
  }

  filtrarProducoes(): void {
    this.producoesFiltradas = this.producoes.filter(prod => {
      const filtro = this.filtroAtivo === 'todos' || prod.cultura === this.filtroAtivo;
      const busca = !this.termoBusca || 
        this.getNomePropriedade(prod.propriedadeId).toLowerCase().includes(this.termoBusca.toLowerCase()) ||
        prod.cultura.toLowerCase().includes(this.termoBusca.toLowerCase());
      return filtro && busca;
    });
  }

  filtrarMovimentacoes(): void {
    const dias = parseInt(this.filtroPeriodo) || 0;
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);
    
    this.movimentacoesFiltradas = this.movimentacoes.filter(mov => {
      const periodo = this.filtroPeriodo === 'todos' || mov.data >= dataLimite;
      const busca = !this.termoBusca || 
        mov.descricao.toLowerCase().includes(this.termoBusca.toLowerCase()) || 
        (mov.propriedade && mov.propriedade.toLowerCase().includes(this.termoBusca.toLowerCase()));
      return periodo && busca;
    });
  }

  // Métodos auxiliares
  getNomePropriedade(id: number): string {
    const prop = this.propriedades.find(p => p.id === id);
    return prop ? prop.nome : 'Desconhecida';
  }

  toggleCultura(cultura: string): void {
    const index = this.propriedadeEditada.culturas.indexOf(cultura);
    if (index === -1) {
      this.propriedadeEditada.culturas.push(cultura);
    } else {
      this.propriedadeEditada.culturas.splice(index, 1);
    }
  }

  // Cálculos
  calcularAreaTotal(): number {
    return this.propriedades.reduce((total, prop) => total + prop.area, 0);
  }

  contarCulturasAtivas(): number {
    const culturasUnicas = new Set();
    this.propriedades.forEach(prop => {
      prop.culturas.forEach((c: string) => culturasUnicas.add(c));
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

  // Edição de itens
  editarPropriedade(prop: any): void {
    this.propriedadeEditada = { ...prop };
    this.modalTitulo = 'Editar Propriedade';
    this.tipoEdicao = 'propriedade';
    this.modalAberto = true;
  }

  editarProducao(prod: any): void {
    this.producaoEditada = { ...prod };
    this.modalTitulo = 'Editar Produção';
    this.tipoEdicao = 'producao';
    this.modalAberto = true;
  }

  editarMovimentacao(mov: any): void {
    this.movimentacaoEditada = { ...mov };
    this.modalTitulo = 'Editar Movimentação';
    this.tipoEdicao = 'movimentacao';
    this.modalAberto = true;
  }

  // Confirmação de exclusão
  confirmarExclusao(item: any, tipo: string): void {
    this.itemParaExcluir = item;
    this.tipoExclusao = tipo;
    this.mensagemConfirmacao = `Confirmar exclusão deste ${tipo}?`;
    this.confirmacaoAberta = true;
  }
  
  cancelarExclusao(): void {
    this.confirmacaoAberta = false;
    this.itemParaExcluir = null;
    this.tipoExclusao = '';
  }
  
  executarExclusao(): void {
    switch (this.tipoExclusao) {
      case 'propriedade':
        this.propriedades = this.propriedades.filter(p => p.id !== this.itemParaExcluir.id);
        // Remover produções relacionadas
        this.producoes = this.producoes.filter(p => p.propriedadeId !== this.itemParaExcluir.id);
        break;
      case 'producao':
        this.producoes = this.producoes.filter(p => p.id !== this.itemParaExcluir.id);
        break;
      case 'movimentacao':
        this.movimentacoes = this.movimentacoes.filter(m => m.id !== this.itemParaExcluir.id);
        break;
    }
  
    this.confirmacaoAberta = false;
    this.aplicarFiltros();
  }
  
  // Geração de novo ID
  gerarNovoId(lista: any[]): number {
    const ids = lista.map(item => item.id);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }

  // Métodos de salvamento
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
    if (this.propriedadeEditada.id) {
      // Edição
      const index = this.propriedades.findIndex(p => p.id === this.propriedadeEditada.id);
      if (index !== -1) {
        this.propriedades[index] = { ...this.propriedadeEditada };
      }
    } else {
      // Novo
      this.propriedadeEditada.id = this.gerarNovoId(this.propriedades);
      this.propriedades.push({ ...this.propriedadeEditada });
    }
    this.fecharModal();
    this.aplicarFiltros();
  }

  salvarProducao(): void {
    if (this.producaoEditada.id) {
      // Edição
      const index = this.producoes.findIndex(p => p.id === this.producaoEditada.id);
      if (index !== -1) {
        this.producoes[index] = { ...this.producaoEditada };
      }
    } else {
      // Novo
      this.producaoEditada.id = this.gerarNovoId(this.producoes);
      this.producoes.push({ ...this.producaoEditada });
    }
    this.fecharModal();
    this.aplicarFiltros();
  }

  salvarMovimentacao(): void {
    if (this.movimentacaoEditada.id) {
      // Edição
      const index = this.movimentacoes.findIndex(m => m.id === this.movimentacaoEditada.id);
      if (index !== -1) {
        this.movimentacoes[index] = { ...this.movimentacaoEditada };
      }
    } else {
      // Novo
      this.movimentacaoEditada.id = this.gerarNovoId(this.movimentacoes);
      this.movimentacoes.push({ ...this.movimentacaoEditada });
    }
    this.fecharModal();
    this.aplicarFiltros();
  }

  // Configurações do usuário
  salvarConfig(): void {
    if (this.novaSenha) {
      // Aqui você implementaria a lógica para alterar a senha
      console.log('Senha alterada para:', this.novaSenha);
    }
    this.fecharConfig();
  }

  // Relatórios
  gerarRelatorio(): void {
    // Destruir gráfico anterior se existir
    if (this.relatorioChart) {
      this.relatorioChart.destroy();
    }
    
    const ctx = document.getElementById('reportChart') as HTMLCanvasElement;
    
    // Dados de exemplo para o gráfico - você deve substituir por seus dados reais
    let labels: string[] = [];
    let data: number[] = [];
    
    switch (this.tipoRelatorio) {
      case 'produtividade':
        labels = this.todasCulturas;
        data = labels.map(cultura => {
          const producoesCultura = this.producoes.filter(p => p.cultura === cultura);
          if (producoesCultura.length === 0) return 0;
          const total = producoesCultura.reduce((sum, p) => sum + (p.quantidade / p.area), 0);
          return total / producoesCultura.length;
        });
        break;
        
      case 'financeiro':
        labels = ['Receitas', 'Despesas', 'Resultado'];
        data = [
          this.calcularTotalReceitas(),
          this.calcularTotalDespesas(),
          this.calcularResultadoFinanceiro()
        ];
        break;
        
      case 'producao':
        labels = this.safras;
        data = labels.map(safra => {
          return this.producoes
            .filter(p => p.safra === safra)
            .reduce((sum, p) => sum + p.quantidade, 0);
        });
        break;
    }
    
    this.relatorioChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: this.tipoRelatorio === 'financeiro' ? 'Valor (R$)' : 
                (this.tipoRelatorio === 'produtividade' ? 'Produtividade (kg/ha)' : 'Produção (kg)'),
          data: data,
          backgroundColor: this.tipoRelatorio === 'financeiro' ? 
            ['#4CAF50', '#F44336', '#2196F3'] : '#4CAF50',
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
  }
}