
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../login/login/login.component';
import { MenuComponent } from '../navbar/menu/menu.component';
import { HomeComponent } from '../home/home/home.component';
import { AssinaturaComponent } from '../assinatura/assinatura/assinatura.component';
import { EstatisticaComponent } from '../estatisticas/estatistica/estatistica.component';
import { RelatorioComponent } from '../relatorio/relatorio/relatorio.component';



export const routes: Routes = [
  { path: '', component:HomeComponent },
  { path:"login",  component: LoginComponent},
  { path:"menu" , component: MenuComponent},
  { path: "home", component: HomeComponent},
  { path: "assinatura", component: AssinaturaComponent},
  { path:"estatistica", component: EstatisticaComponent},
  { path: "relatorio", component: RelatorioComponent  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }