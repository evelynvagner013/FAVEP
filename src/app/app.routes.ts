
import { NgModule } from '@angular/core';
import { RouterModule, RouterOutlet, Routes } from '@angular/router';
import { HomeComponent } from '../Pages/home/home.component';

import { MenuComponent } from '../Pages/navbar/menu/menu.component';
import { AssinaturaComponent } from '../Pages/assinatura/assinatura/assinatura.component';
import { EstatisticaComponent } from '../Pages/estatistica/estatistica.component';
import { RelatorioComponent } from '../Pages/relatorio/relatorio/relatorio.component';
import { UsuarioComponent } from '../Pages/Auth/usuario/usuario.component';
import { ContatoComponent } from '../Pages/contato/contato.component';
import { GerenciamentoComponent } from '../Pages/gerenciamento/gerenciamento.component';
import { RegistrosComponent } from '../Pages/registros/registros.component';
import { LoginComponent } from '../Pages/Auth/login/login.component';
import { MenuCimaComponent } from '../Pages/navbar/menu-cima/menu-cima.component';





export const routes: Routes = [
  { path: '', component:HomeComponent },
  { path: 'login', component: LoginComponent },
  { path:"menu" , component: MenuComponent},
  { path: "home", component: HomeComponent},
  { path: "assinatura", component: AssinaturaComponent},
  { path:'estatistica', component: EstatisticaComponent},
  { path: "relatorio", component: RelatorioComponent  },
  { path: "gerenciamento", component: GerenciamentoComponent},
  { path: "contato", component: ContatoComponent},
  { path: 'usuario', component: UsuarioComponent },
  { path: 'registros', component: RegistrosComponent },
  { path: 'menuCima', component: MenuCimaComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    RouterOutlet], 
  exports: [RouterModule]
})
export class AppRoutingModule { }