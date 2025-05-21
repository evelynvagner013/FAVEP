import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuComponent } from "../../navbar/menu/menu.component";

@Component({
  selector: 'app-assinatura',
  standalone: true,
  imports: [RouterLink, MenuComponent],
  templateUrl: './assinatura.component.html',
  styleUrl: './assinatura.component.css'
})
export class AssinaturaComponent {
  usuarioNome: string = 'João Agricultor';
  usuarioFoto: string = 'assets/user-avatar.jpg';

  ngAfterViewInit(): void {
    const carousel = document.querySelector('.carousel-track') as HTMLElement;
    const prevBtn = document.querySelector('.prev') as HTMLElement;
    const nextBtn = document.querySelector('.next') as HTMLElement;
    const cards = document.querySelectorAll('.plan-card') as NodeListOf<HTMLElement>;

    const cardWidth = cards[0].offsetWidth + 17; // largura + margem
    const visibleWidth = (carousel.parentElement as HTMLElement).offsetWidth;
    const maxScroll = (cards.length * cardWidth) - visibleWidth;

    let scrollPosition = 0;

    nextBtn.addEventListener('click', () => {
      if (scrollPosition < maxScroll) {
        scrollPosition += cardWidth;
        if (scrollPosition > maxScroll) scrollPosition = maxScroll;
        carousel.style.transform = `translateX(-${scrollPosition}px)`;
      }
    });

    prevBtn.addEventListener('click', () => {
      if (scrollPosition > 0) {
        scrollPosition -= cardWidth;
        if (scrollPosition < 0) scrollPosition = 0;
        carousel.style.transform = `translateX(-${scrollPosition}px)`;
      }
    });
  }
  

}
