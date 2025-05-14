
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../login/login/login.component';
import { MenuComponent } from '../navbar/menu/menu.component';
import { HomeComponent } from '../home/home/home.component';
import { AssinaturaComponent } from '../assinatura/assinatura/assinatura.component';
import { EstatisticaComponent } from '../estatisticas/estatistica/estatistica.component';
import { RelatorioComponent } from '../relatorio/relatorio/relatorio.component';
import { GerenciamentoComponent } from '../gerenciamento/gerenciamento/gerenciamento.component';
import { ContatoComponent } from '../contato/contato.component';
import { UsuarioComponent } from '../usuario/usuario.component';
import { RegistrosComponent } from '../registros/registros.component';
import { ConfiguracaoComponent } from '../configuracao/configuracao.component';



export const routes: Routes = [
  { path: '', component:HomeComponent },
  { path:"login",  component: LoginComponent},
  { path:"menu" , component: MenuComponent},
  { path: "home", component: HomeComponent},
  { path: "assinatura", component: AssinaturaComponent},
  { path:"estatistica", component: EstatisticaComponent},
  { path: "relatorio", component: RelatorioComponent  },
  { path: "gerenciamento", component: GerenciamentoComponent},
  { path: "contato", component: ContatoComponent},
  { path: 'usuario', component: UsuarioComponent },
  { path: 'registros', component: RegistrosComponent },
  { path: "configuracao", component: ConfiguracaoComponent}


];

@NgModule({
  imports: [RouterModule.forRoot(routes),], 
  exports: [RouterModule]
})
export class AppRoutingModule { }