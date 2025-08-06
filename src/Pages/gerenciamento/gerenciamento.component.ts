import { Component, HostListener, OnInit, OnDestroy } from '@angular/core'; // Adicionado OnDestroy
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { Subscription } from 'rxjs'; // Importar Subscription

// --- SERVIÇOS ---
import { DashboardDataService } from '../../services/dashboard-data.service';
import { PropriedadeService } from '../../services/propriedade.service';
import { ProducaoService } from '../../services/producao.service';
import { MovimentacaoService } from '../../services/movimentacao.service';
import { AuthService } from '../../services/auth.service'; // 1. IMPORTAR O AUTHSERVICE
import {
  Usuario,
  Propriedade,
  Producao,
  Movimentacao,
} from '../../models/api.models';

registerLocaleData(localePt);

@Component({
  selector: 'app-gerenciamento',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './gerenciamento.component.html',
  styleUrl: './gerenciamento.component.css',
})
export class GerenciamentoComponent implements OnInit, OnDestroy { // Implementar OnDestroy

  menuAberto = false;
  // Informações do usuário (virão do AuthService)
  usuarioNome: string = '';
  usuarioFoto: string = 'https://placehold.co/40x40/aabbcc/ffffff?text=User';

  abaAtiva: string = 'propriedades';
  modalAberto: boolean = false;
  confirmacaoAberta: boolean = false;
  modalTitulo: string = '';
  mensagemConfirmacao: string = '';
  tipoEdicao: string = '';
  itemParaExcluir: any = null;
  tipoExclusao: string = '';
  filtroAtivo: string = 'todos';
  filtroPeriodo: string = '30';
  termoBusca: string = '';
  opcoesFiltro: { valor: string; texto: string }[] = [{ valor: 'todos', texto: 'Todos' }];

  propriedades: Propriedade[] = [];
  producoes: Producao[] = [];
  movimentacoes: Movimentacao[] = [];

  propriedadesFiltradas: Propriedade[] = [];
  producoesFiltradas: Producao[] = [];
  movimentacoesFiltradas: Movimentacao[] = [];

  propriedadeEditada: Partial<Propriedade> = {};
  producaoEditada: Partial<Producao> = {};
  movimentacaoEditada: Partial<Movimentacao> = { tipo: 'receita' };

  todasCulturas: string[] = [];
  safras: string[] = [];

  // Variável para guardar a inscrição e limpá-la depois
  private userSubscription: Subscription | undefined;

  // 2. INJETAR O AUTHSERVICE NO CONSTRUTOR
  constructor(
    private dashboardDataService: DashboardDataService,
    private propriedadeService: PropriedadeService,
    private producaoService: ProducaoService,
    private movimentacaoService: MovimentacaoService,
    private authService: AuthService, // Adicionado
    private datePipe: DatePipe
  ) {}

  // 3. ATUALIZAR ngOnInit PARA USAR O PADRÃO REATIVO
  ngOnInit(): void {
    // Inscreve-se para ouvir mudanças nos dados do usuário
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      if (user) {
        this.usuarioNome = user.nome;
        this.usuarioFoto = user.fotoPerfil || 'https://placehold.co/40x40/aabbcc/ffffff?text=User';
      }
    });
    
    // Carrega os dados específicos da página de gerenciamento
    this.carregarTodosDados();
  }

  // 4. CRIAR ngOnDestroy PARA LIMPEZA
  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // 5. REMOVER A LÓGICA DE PERFIL DESTE MÉTODO
  carregarTodosDados(): void {
    this.dashboardDataService.carregarDadosDashboard().subscribe({
      next: (data) => {
        // A informação do 'perfil' não é mais necessária aqui
        const { propriedades, producoes, movimentacoes } = data;

        this.propriedades = propriedades;
        this.producoes = producoes;
        this.movimentacoes = movimentacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

        const uniqueCrops = new Set<string>(this.producoes.map(p => p.cultura));
        this.opcoesFiltro = [{ valor: 'todos', texto: 'Todos' }, ...Array.from(uniqueCrops).sort().map(c => ({ valor: c, texto: c }))];
        this.todasCulturas = Array.from(uniqueCrops).sort();
        this.safras = Array.from(new Set(this.producoes.map(p => p.safra).filter(Boolean))).sort();

        this.aplicarFiltros();
      },
      error: (err) => console.error('Erro ao carregar dados:', err),
    });
  }

  // O restante do seu código (filtros, CRUD, UI) permanece igual.
  // ... (código de filtros, CRUD e UI)

  selecionarAba(aba: string): void {
    this.abaAtiva = aba;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.filtrarPropriedades();
    this.filtrarProducoes();
    this.filtrarMovimentacoes();
  }
  
  filtrarPropriedades(): void {
    this.propriedadesFiltradas = this.propriedades.filter(prop =>
      !this.termoBusca || prop.nome.toLowerCase().includes(this.termoBusca.toLowerCase()) ||
      prop.localizacao.toLowerCase().includes(this.termoBusca.toLowerCase())
    );
  }
  
  filtrarProducoes(): void {
    this.producoesFiltradas = this.producoes.filter(prod => {
      const filtroCultura = this.filtroAtivo === 'todos' || prod.cultura === this.filtroAtivo;
      const busca = !this.termoBusca ||
        this.getNomePropriedade(prod.propriedadeId).toLowerCase().includes(this.termoBusca.toLowerCase()) ||
        prod.cultura.toLowerCase().includes(this.termoBusca.toLowerCase()) ||
        prod.safra.toLowerCase().includes(this.termoBusca.toLowerCase());
      return filtroCultura && busca;
    });
  }

  filtrarMovimentacoes(): void {
    const dias = parseInt(this.filtroPeriodo, 10);
    const dataLimite = new Date();
    if (!isNaN(dias)) {
      dataLimite.setDate(dataLimite.getDate() - dias);
    }
  
    this.movimentacoesFiltradas = this.movimentacoes.filter(mov => {
      const periodo = this.filtroPeriodo === 'todos' || new Date(mov.data) >= dataLimite;
      const busca = !this.termoBusca ||
        (mov.descricao && mov.descricao.toLowerCase().includes(this.termoBusca.toLowerCase())) ||
        (mov.propriedade && this.getNomePropriedade(mov.propriedade).toLowerCase().includes(this.termoBusca.toLowerCase()));
      return periodo && busca;
    });
  }

  calcularAreaTotal(): number {
    return this.propriedades.reduce((total, prop) => total + prop.area, 0);
  }

  contarCulturasAtivas(): number {
    return new Set(this.producoes.map(p => p.cultura)).size;
  }

  calcularProducaoTotal(): number {
    return this.producoes.reduce((total, prod) => total + (prod.quantidade || 0), 0);
  }

  calcularAreaPlantada(): number {
    const propertyIds = new Set(this.producoes.map(p => String(p.propriedadeId)));
    return this.propriedades
      .filter(p => propertyIds.has(String(p.id)))
      .reduce((total, prop) => total + prop.area, 0);
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

  executarExclusao(): void {
    if (!this.itemParaExcluir || !this.itemParaExcluir.id) return;
    let exclusaoObservable;

    switch (this.tipoExclusao) {
      case 'propriedades':
        exclusaoObservable = this.propriedadeService.excluirPropriedade(this.itemParaExcluir.id);
        break;
      case 'producao':
        exclusaoObservable = this.producaoService.excluirProducao(String(this.itemParaExcluir.id));
        break;
      case 'financeiro':
        exclusaoObservable = this.movimentacaoService.excluirMovimentacao(String(this.itemParaExcluir.id));
        break;
      default:
        this.cancelarExclusao();
        return;
    }

    exclusaoObservable.subscribe({
      next: () => {
        this.carregarTodosDados();
        this.cancelarExclusao();
      },
      error: (err) => console.error(`Erro ao excluir ${this.tipoExclusao}:`, err),
    });
  }

  salvar(): void {
    switch (this.tipoEdicao) {
      case 'propriedades': this.salvarPropriedade(); break;
      case 'producao': this.salvarProducao(); break;
      case 'financeiro': this.salvarMovimentacao(); break;
    }
  }

  salvarPropriedade(): void {
    const { id, ...dados } = this.propriedadeEditada;
    const observable = id 
      ? this.propriedadeService.atualizarPropriedade(id, dados)
      : this.propriedadeService.adicionarPropriedade(dados as Omit<Propriedade, 'id' | 'proprietarioId'>);
    
    observable.subscribe({
      next: () => { this.carregarTodosDados(); this.fecharModal(); },
      error: (err) => console.error('Erro ao salvar propriedade:', err),
    });
  }

  salvarProducao(): void {
    const { id, ...dados } = this.producaoEditada;
    const observable = id
      ? this.producaoService.atualizarProducao(String(id), dados)
      : this.producaoService.adicionarProducao(dados as Omit<Producao, 'id'>);
      
    observable.subscribe({
      next: () => { this.carregarTodosDados(); this.fecharModal(); },
      error: (err) => console.error('Erro ao salvar produção:', err),
    });
  }

  salvarMovimentacao(): void {
    const { id, ...dados } = this.movimentacaoEditada;
    const observable = id
      ? this.movimentacaoService.atualizarMovimentacao(String(id), dados)
      : this.movimentacaoService.adicionarMovimentacao(dados as Omit<Movimentacao, 'id'>);

    observable.subscribe({
      next: () => { this.carregarTodosDados(); this.fecharModal(); },
      error: (err) => console.error('Erro ao salvar movimentação:', err),
    });
  }
  
  @HostListener('document:click', ['$event'])
  fecharMenuFora(event: MouseEvent) {
    const alvo = event.target as HTMLElement;
    if (!alvo.closest('.menu-toggle') && !alvo.closest('.main-menu')) {
      this.menuAberto = false;
    }
  }

  abrirModalAdicionar(): void {
    this.modalAberto = true;
    this.tipoEdicao = this.abaAtiva;
    this.modalTitulo = `Adicionar ${this.getTituloModal()}`;
  
    switch (this.tipoEdicao) {
      case 'propriedades': this.propriedadeEditada = {}; break;
      case 'producao': this.producaoEditada = { data: new Date() }; break;
      case 'financeiro': this.movimentacaoEditada = { tipo: 'receita', data: new Date() }; break;
    }
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.propriedadeEditada = {};
    this.producaoEditada = {};
    this.movimentacaoEditada = { tipo: 'receita' };
  }
  
  editarPropriedade(prop: Propriedade): void {
    this.propriedadeEditada = { ...prop };
    this.modalTitulo = 'Editar Propriedade';
    this.tipoEdicao = 'propriedades';
    this.modalAberto = true;
  }
  
  editarProducao(prod: Producao): void {
    this.producaoEditada = { ...prod, data: this.datePipe.transform(prod.data, 'yyyy-MM-dd') as any };
    this.modalTitulo = 'Editar Produção';
    this.tipoEdicao = 'producao';
    this.modalAberto = true;
  }
  
  editarMovimentacao(mov: Movimentacao): void {
    this.movimentacaoEditada = { ...mov, data: this.datePipe.transform(mov.data, 'yyyy-MM-dd') as any };
    this.modalTitulo = 'Editar Movimentação Financeira';
    this.tipoEdicao = 'financeiro';
    this.modalAberto = true;
  }

  confirmarExclusao(item: any, tipo: string): void {
    this.itemParaExcluir = item;
    this.tipoExclusao = tipo;
    this.mensagemConfirmacao = `Confirmar exclusão de "${item.nome || item.descricao || item.cultura}"?`;
    this.confirmacaoAberta = true;
  }

  cancelarExclusao(): void {
    this.confirmacaoAberta = false;
    this.itemParaExcluir = null;
    this.tipoExclusao = '';
  }

  getTituloModal(): string {
    const titulos: { [key: string]: string } = {
      propriedades: 'Propriedade',
      producao: 'Produção',
      financeiro: 'Movimentação Financeira',
    };
    return titulos[this.abaAtiva] || 'Item';
  }

  getNomePropriedade(id: string | number): string {
    const prop = this.propriedades.find((p) => String(p.id) === String(id));
    return prop ? prop.nome : 'N/A';
  }
  
  trackById(index: number, item: any): string {
    return item.id;
  }

  alternarMenu(): void {
    this.menuAberto = !this.menuAberto;
  }
}
