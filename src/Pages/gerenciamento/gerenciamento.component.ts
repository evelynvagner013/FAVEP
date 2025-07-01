import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Chart, registerables não são mais necessários se não houver gráficos no componente
// import { Chart, registerables } from 'chart.js';

import { ApiService, UserProfile, Property, Crop, FinancialRecord as BackendFinancialRecord, Atividade as BackendActivity } from '../../services/api.service';

// Importa o MenuComponent (Adicione se você tiver um MenuComponent aqui)
// import { MenuComponent } from '../../navbar/menu/menu.component';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
registerLocaleData(localePt);


interface Atividade extends Omit<BackendActivity, 'date'> {
  date: Date;
}

interface FinancialRecord extends Omit<BackendFinancialRecord, 'date'> {
  date: Date;
}


@Component({
  selector: 'app-gerenciamento',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    // MenuComponent // Adicione se você tiver um MenuComponent aqui
  ],
  providers: [DatePipe],
  templateUrl: './gerenciamento.component.html',
  styleUrl: './gerenciamento.component.css'
})
export class GerenciamentoComponent implements OnInit {
  menuAberto = false;

  @HostListener('document:click', ['$event'])
  fecharMenuFora(event: MouseEvent) {
    const alvo = event.target as HTMLElement;
    const clicouNoBotao = alvo.closest('.menu-toggle');
    const clicouNoMenu = alvo.closest('.main-menu');

    if (!clicouNoBotao && !clicouNoMenu) {
      this.menuAberto = false;
    }
  }

  usuarioNome: string = 'Carregando...';
  headerUsuarioFoto: string = 'https://placehold.co/40x40/aabbcc/ffffff?text=User';

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
  // Removidas propriedades relacionadas a relatórios
  // tipoRelatorio: string = 'produtividade';
  // periodoRelatorio: string = '30';

  opcoesFiltro: { valor: string; texto: string }[] = [
    { valor: 'todos', texto: 'Todos' },
  ];

  usuario: UserProfile | null = null;
  novaSenha: string = '';

  properties: Property[] = [];
  crops: Crop[] = [];
  activities: Atividade[] = [];
  financialRecords: FinancialRecord[] = [];

  propriedadesFiltradas: Property[] = [];
  producoesFiltradas: Crop[] = [];
  movimentacoesFiltradas: FinancialRecord[] = [];

  propriedadeEditada: Partial<Property> = {};
  producaoEditada: Partial<Crop> = {};
  movimentacaoEditada: Partial<BackendFinancialRecord> = { type: 'revenue' };


  todasCulturas: string[] = [];
  safras: string[] = [];

  // Removida propriedade do gráfico de relatório
  // relatorioChart: Chart | null = null;

  constructor(private apiService: ApiService, private datePipe: DatePipe) {
    // Removido o registro do Chart.js se não houver mais gráficos neste componente
    // Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.apiService.getAllDashboardData().subscribe({
      next: (data) => {
        this.usuario = data.userProfile;
        if (this.usuario) {
          this.usuarioNome = this.usuario.username || 'Usuário';
          this.headerUsuarioFoto = this.usuario.fotoUrl || 'https://placehold.co/40x40/aabbcc/ffffff?text=User';
        } else {
          this.usuarioNome = 'Visitante';
        }

        this.properties = data.properties;
        this.crops = data.crops;
        this.activities = data.activities.map(act => ({
          ...act,
          date: new Date(act.date),
          icone: this.getIconForActivityType(act.type)
        })).sort((a, b) => b.date.getTime() - a.date.getTime());

        this.financialRecords = data.financialRecords.map(rec => ({
          ...rec,
          date: new Date(rec.date)
        })).sort((a, b) => b.date.getTime() - a.date.getTime());

        const uniqueCrops = new Set<string>();
        this.crops.forEach(crop => uniqueCrops.add(crop.name));
        this.opcoesFiltro = [{ valor: 'todos', texto: 'Todos' }];
        Array.from(uniqueCrops).sort().forEach(cultura => {
          this.opcoesFiltro.push({ valor: cultura, texto: cultura });
        });
        this.todasCulturas = Array.from(uniqueCrops).sort();

        const uniqueSafras = new Set<string>();
        this.crops.forEach(crop => {
          if (crop.type) {
            uniqueSafras.add(crop.type);
          }
        });
        this.safras = Array.from(uniqueSafras).sort();

        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
      }
    });
  }

  selecionarAba(aba: string): void {
    this.abaAtiva = aba;
    this.aplicarFiltros();
    // Removida a chamada a gerarRelatorio()
    // if (this.abaAtiva === 'relatorios') {
    //   this.gerarRelatorio();
    // }
  }

  abrirModalAdicionar(): void {
    this.modalAberto = true;
    this.tipoEdicao = this.abaAtiva;
    this.modalTitulo = `Adicionar ${this.getTituloModal()}`;

    switch (this.tipoEdicao) {
      case 'propriedades':
        this.propriedadeEditada = { name: '', location: '', area: 0 };
        break;
      case 'producao':
        this.producaoEditada = { name: '', type: '', plantingDate: '', property: '' };
        break;
      case 'financeiro':
        this.movimentacaoEditada = {
          type: 'revenue',
          amount: 0,
          date: this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '',
          description: '',
          property: ''
        };
        break;
    }
  }

  getTituloModal(): string {
    switch (this.tipoEdicao) {
      case 'propriedades': return 'Propriedade';
      case 'producao': return 'Cultura';
      case 'financeiro': return 'Movimentação Financeira';
      default: return 'Item';
    }
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.propriedadeEditada = {};
    this.producaoEditada = {};
    this.movimentacaoEditada = { type: 'revenue' };
  }

  abrirConfiguracoes(): void {
    this.configAberto = true;
  }

  fecharConfig(): void {
    this.configAberto = false;
    this.novaSenha = '';
  }

  aplicarFiltros(): void {
    switch (this.abaAtiva) {
      case 'propriedades':
        this.filtrarPropriedades();
        break;
      case 'producao':
        this.filtrarCulturas();
        break;
      case 'financeiro':
        this.filtrarMovimentacoes();
        break;
    }
  }

  filtrarPropriedades(): void {
    this.propriedadesFiltradas = this.properties.filter(prop => {
      const busca = !this.termoBusca ||
        prop.name.toLowerCase().includes(this.termoBusca.toLowerCase()) ||
        prop.location.toLowerCase().includes(this.termoBusca.toLowerCase());
      return busca;
    });
  }

  filtrarCulturas(): void {
    this.producoesFiltradas = this.crops.filter(crop => {
      const filtroCultura = this.filtroAtivo === 'todos' || crop.name === this.filtroAtivo;
      const busca = !this.termoBusca ||
        this.getPropertyName(crop.property).toLowerCase().includes(this.termoBusca.toLowerCase()) ||
        crop.name.toLowerCase().includes(this.termoBusca.toLowerCase()) ||
        crop.type.toLowerCase().includes(this.termoBusca.toLowerCase());
      return filtroCultura && busca;
    });
  }

  filtrarMovimentacoes(): void {
    const dias = parseInt(this.filtroPeriodo);
    const dataLimite = new Date();
    if (!isNaN(dias)) {
      dataLimite.setDate(dataLimite.getDate() - dias);
    }

    this.movimentacoesFiltradas = this.financialRecords.filter(mov => {
      const periodo = this.filtroPeriodo === 'todos' || (mov.date >= dataLimite);
      const busca = !this.termoBusca ||
        (mov.description && mov.description.toLowerCase().includes(this.termoBusca.toLowerCase())) ||
        (mov.property && this.getPropertyName(mov.property).toLowerCase().includes(this.termoBusca.toLowerCase()));
      return periodo && busca;
    });
  }

  getPropertyName(id: string): string {
    const prop = this.properties.find(p => p._id === id);
    return prop ? prop.name : 'Desconhecida';
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

  calcularAreaTotal(): number {
    return this.properties.reduce((total, prop) => total + prop.area, 0);
  }

  contarCulturasAtivas(): number {
    const culturasUnicas = new Set<string>();
    this.crops.forEach(crop => culturasUnicas.add(crop.name));
    return culturasUnicas.size;
  }

  calcularProducaoTotal(): number {
    return this.crops.reduce((total, crop) => total + (crop.actualYield || 0), 0);
  }

  calcularAreaPlantada(): number {
    const areasComCulturas = new Set<string>();
    this.crops.forEach(crop => {
      if (crop.property) {
        areasComCulturas.add(crop.property);
      }
    });

    let totalArea = 0;
    areasComCulturas.forEach(propertyId => {
      const prop = this.properties.find(p => p._id === propertyId);
      if (prop) {
        totalArea += prop.area;
      }
    });
    return totalArea;
  }

  calcularProdutividadeMedia(): number {
    const totalProducao = this.calcularProducaoTotal();
    const totalArea = this.calcularAreaPlantada();
    return totalArea > 0 ? totalProducao / totalArea : 0;
  }

  calcularTotalReceitas(): number {
    return this.financialRecords
      .filter(m => m.type === 'revenue')
      .reduce((total, m) => total + m.amount, 0);
  }

  calcularTotalDespesas(): number {
    return this.financialRecords
      .filter(m => m.type === 'expense')
      .reduce((total, m) => total + m.amount, 0);
  }

  calcularResultadoFinanceiro(): number {
    return this.calcularTotalReceitas() - this.calcularTotalDespesas();
  }

  editarPropriedade(prop: Property): void {
    this.propriedadeEditada = { ...prop };
    this.modalTitulo = 'Editar Propriedade';
    this.tipoEdicao = 'propriedades';
    this.modalAberto = true;
  }

  editarProducao(crop: Crop): void {
    this.producaoEditada = { ...crop };
    if (crop.plantingDate) {
      this.producaoEditada.plantingDate = this.datePipe.transform(crop.plantingDate, 'yyyy-MM-dd') || '';
    }
    if (crop.harvestDate) {
      this.producaoEditada.harvestDate = this.datePipe.transform(crop.harvestDate, 'yyyy-MM-dd') || '';
    }
    this.modalTitulo = 'Editar Cultura';
    this.tipoEdicao = 'producao';
    this.modalAberto = true;
  }

  editarMovimentacao(mov: FinancialRecord): void {

    
    if (mov.date) {
      this.movimentacaoEditada.date = this.datePipe.transform(mov.date, 'yyyy-MM-dd') || '';
    }
    
  }

  confirmarExclusao(item: any, tipo: string): void {
    this.itemParaExcluir = item;
    this.tipoExclusao = tipo;
    this.mensagemConfirmacao = `Confirmar exclusão de "${tipo === 'propriedades' ? item.name : (item.description || item.name)}"?`;
    this.confirmacaoAberta = true;
  }

  cancelarExclusao(): void {
    this.confirmacaoAberta = false;
    this.itemParaExcluir = null;
    this.tipoExclusao = '';
  }

  executarExclusao(): void {
    if (!this.itemParaExcluir || !this.itemParaExcluir._id) {
      console.error('Item para exclusão inválido ou sem ID.');
      this.cancelarExclusao();
      return;
    }

    switch (this.tipoExclusao) {
      case 'propriedades':
        this.apiService.deleteProperty(this.itemParaExcluir._id).subscribe({
          next: () => {
            this.properties = this.properties.filter(p => p._id !== this.itemParaExcluir._id);
            this.aplicarFiltros();
            this.confirmacaoAberta = false;
          },
          error: (err) => console.error('Erro ao excluir propriedade:', err)
        });
        break;
      case 'producao':
        this.apiService.deleteCrop(this.itemParaExcluir._id).subscribe({
          next: () => {
            this.crops = this.crops.filter(c => c._id !== this.itemParaExcluir._id);
            this.aplicarFiltros();
            this.confirmacaoAberta = false;
          },
          error: (err) => console.error('Erro ao excluir cultura:', err)
        });
        break;
      case 'financeiro':
        this.apiService.deleteFinancialRecord(this.itemParaExcluir._id).subscribe({
          next: () => {
            this.financialRecords = this.financialRecords.filter(m => m._id !== this.itemParaExcluir._id);
            this.aplicarFiltros();
            this.confirmacaoAberta = false;
          },
          error: (err) => console.error('Erro ao excluir movimentação:', err)
        });
        break;
      default:
        console.warn('Tipo de exclusão desconhecido:', this.tipoExclusao);
        this.cancelarExclusao();
    }
    this.itemParaExcluir = null;
    this.tipoExclusao = '';
  }

  salvar(): void {
    switch (this.tipoEdicao) {
      case 'propriedades':
        this.salvarPropriedade();
        break;
      case 'producao':
        this.salvarCultura();
        break;
      case 'financeiro':
        this.salvarMovimentacao();
        break;
    }
  }

  salvarPropriedade(): void {
    if (!this.propriedadeEditada.name || !this.propriedadeEditada.location || this.propriedadeEditada.area === undefined || this.propriedadeEditada.area <= 0) {
      console.error('Dados da propriedade incompletos ou inválidos.');
      return;
    }

    if (this.propriedadeEditada._id) {
      this.apiService.updateProperty(this.propriedadeEditada._id, this.propriedadeEditada).subscribe({
        next: (updatedProp) => {
          const index = this.properties.findIndex(p => p._id === updatedProp._id);
          if (index !== -1) {
            this.properties[index] = updatedProp;
          }
          this.fecharModal();
          this.aplicarFiltros();
        },
        error: (err) => console.error('Erro ao atualizar propriedade:', err)
      });
    } else {
      this.apiService.addProperty(this.propriedadeEditada as Omit<Property, '_id' | 'owner'>).subscribe({
        next: (newProp) => {
          this.properties.push(newProp);
          this.fecharModal();
          this.aplicarFiltros();
        },
        error: (err) => console.error('Erro ao adicionar propriedade:', err)
      });
    }
  }

  salvarCultura(): void {
    if (!this.producaoEditada.name || !this.producaoEditada.type || !this.producaoEditada.plantingDate || !this.producaoEditada.property) {
      console.error('Dados da cultura incompletos.');
      return;
    }

    const plantingDate = this.datePipe.transform(this.producaoEditada.plantingDate, 'yyyy-MM-ddTHH:mm:ss.SSSZ') || '';
    const harvestDate = this.producaoEditada.harvestDate ? (this.datePipe.transform(this.producaoEditada.harvestDate, 'yyyy-MM-ddTHH:mm:ss.SSSZ') || '') : undefined;

    const cropToSave: Partial<Crop> = {
      ...this.producaoEditada,
      plantingDate: plantingDate,
      harvestDate: harvestDate,
      expectedYield: this.producaoEditada.expectedYield ? Number(this.producaoEditada.expectedYield) : undefined,
      actualYield: this.producaoEditada.actualYield ? Number(this.producaoEditada.actualYield) : undefined,
    };

    if (this.producaoEditada._id) {
      this.apiService.updateCrop(this.producaoEditada._id, cropToSave).subscribe({
        next: (updatedCrop) => {
          const index = this.crops.findIndex(c => c._id === updatedCrop._id);
          if (index !== -1) {
            this.crops[index] = updatedCrop;
          }
          this.fecharModal();
          this.aplicarFiltros();
        },
        error: (err) => console.error('Erro ao atualizar cultura:', err)
      });
    } else {
      this.apiService.addCrop(cropToSave as Omit<Crop, '_id' | 'owner'>).subscribe({
        next: (newCrop) => {
          this.crops.push(newCrop);
          this.fecharModal();
          this.aplicarFiltros();
        },
        error: (err) => console.error('Erro ao adicionar cultura:', err)
      });
    }
  }

  salvarMovimentacao(): void {
    if (!this.movimentacaoEditada.type || !this.movimentacaoEditada.description || this.movimentacaoEditada.amount === undefined || !this.movimentacaoEditada.date) {
      console.error('Dados da movimentação incompletos.');
      return;
    }
    if (this.movimentacaoEditada.amount <= 0) {
      console.error('O valor da movimentação deve ser maior que zero.');
      return;
    }

    const recordDate = this.datePipe.transform(this.movimentacaoEditada.date, 'yyyy-MM-ddTHH:mm:ss.SSSZ') || '';

    const recordToSave: Partial<BackendFinancialRecord> = {
      ...this.movimentacaoEditada,
      amount: Number(this.movimentacaoEditada.amount),
      date: recordDate
    };

    if (this.movimentacaoEditada._id) {
      this.apiService.updateFinancialRecord(this.movimentacaoEditada._id, recordToSave).subscribe({
        next: (updatedRecord) => {
          const index = this.financialRecords.findIndex(r => r._id === updatedRecord._id);
          if (index !== -1) {
            this.financialRecords[index] = { ...updatedRecord, date: new Date(updatedRecord.date) };
          }
          this.fecharModal();
          this.aplicarFiltros();
        },
        error: (err) => console.error('Erro ao atualizar movimentação:', err)
      });
    } else {
      this.apiService.addFinancialRecord(recordToSave as Omit<BackendFinancialRecord, '_id' | 'owner'>).subscribe({
        next: (newRecord) => {
          this.financialRecords.push({ ...newRecord, date: new Date(newRecord.date) });
          this.fecharModal();
          this.aplicarFiltros();
        },
        error: (err) => console.error('Erro ao adicionar movimentação:', err)
      });
    }
  }

  trackById(index: number, item: any): string {
    return item._id;
  }
}
