import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuCimaComponent } from '../navbar/menu-cima/menu-cima.component';
import { FooterComponent } from '../footer/footer.component';


@Component({
  selector: 'app-contato',
   standalone: true,
  imports: [RouterLink, MenuCimaComponent, FooterComponent, RouterLinkActive],
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.css']
})
export class ContatoComponent {
  
  sendEmail(event: Event) {
    event.preventDefault();
    const nome = (document.getElementById("nome-email") as HTMLInputElement).value;
    const mensagem = (document.getElementById("mensagem-email") as HTMLTextAreaElement).value;
    const destinatario = "seuemail@exemplo.com"; // Altere aqui

    const assunto = `Mensagem de ${nome}`;
    const corpo = encodeURIComponent(mensagem);

    window.location.href = `mailto:${destinatario}?subject=${assunto}&body=${corpo}`;
  }

  sendWhatsApp(event: Event) {
    event.preventDefault();
    const nome = (document.getElementById("nome-whatsapp") as HTMLInputElement).value;
    const mensagem = (document.getElementById("mensagem-whatsapp") as HTMLTextAreaElement).value;

    const texto = encodeURIComponent(`Olá, meu nome é ${nome}. Estou com o seguinte problema:\n${mensagem}`);
    const numero = "5561999999999"; // Altere aqui

    window.open(`https://wa.me/${numero}?text=${texto}`, "_blank");
  }
}
