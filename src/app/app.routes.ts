
import { NgModule } from '@angular/core';
import { RouterModule, RouterOutlet, Routes } from '@angular/router';
import { AssinaturaComponent } from '../Pages/assinatura/assinatura/assinatura.component';
import { UsuarioComponent } from '../Pages/Auth/usuario/usuario.component';
import { ContatoComponent } from '../Pages/contato/contato.component';
import { EstatisticaComponent } from '../Pages/estatistica/estatistica.component';
import { GerenciamentoComponent } from '../Pages/gerenciamento/gerenciamento.component';
import { HomeComponent } from '../Pages/home/home.component';
import { MenuCimaComponent } from '../Pages/navbar/menu-cima/menu-cima.component';
import { MenuComponent } from '../Pages/navbar/menu/menu.component';
import { RegistrosComponent } from '../Pages/registros/registros.component';
import { RelatorioComponent } from '../Pages/relatorio/relatorio/relatorio.component';
import { ParceirosComponent } from '../Pages/parceiros/parceiros.component';





export const routes: Routes = [
  { path: '', component:HomeComponent },
  { path: 'menu' , component: MenuComponent},
  { path: 'home', component: HomeComponent},
  { path: 'assinatura', component: AssinaturaComponent},
  { path: 'estatistica', component: EstatisticaComponent},
  { path: 'relatorio', component: RelatorioComponent  },
  { path: 'gerenciamento', component: GerenciamentoComponent},
  { path: 'contato', component: ContatoComponent},
  { path: 'usuario', component: UsuarioComponent },
  { path: 'registros', component: RegistrosComponent },
  { path: 'menuCima', component: MenuCimaComponent},
  { path: 'parceiros', component: ParceirosComponent} 
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    RouterOutlet], 
  exports: [RouterModule]
})
export class AppRoutingModule { }