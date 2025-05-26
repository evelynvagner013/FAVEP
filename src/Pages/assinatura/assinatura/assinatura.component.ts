import { Component, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuComponent } from "../../navbar/menu/menu.component";

@Component({
  selector: 'app-assinatura',
  standalone: true,
  imports: [RouterLink, MenuComponent],
  templateUrl: './assinatura.component.html',
  styleUrl: './assinatura.component.css'
})
export class AssinaturaComponent implements AfterViewInit {
  usuarioNome: string = 'João Agricultor';
  usuarioFoto: string = 'assets/user-avatar.jpg';

  ngAfterViewInit(): void {
    const carousel = document.querySelector('.carousel-track') as HTMLElement;
    const prevBtn = document.querySelector('.prev') as HTMLElement;
    const nextBtn = document.querySelector('.next') as HTMLElement;
    const originalCards = Array.from(document.querySelectorAll('.plan-card')) as HTMLElement[];

    if (!carousel || !prevBtn || !nextBtn || originalCards.length === 0) return;

    const cardWidth = originalCards[0].offsetWidth + 15;
    let currentIndex = 1;

    // 1. Clonar primeiro e último
    const firstClone = originalCards[0].cloneNode(true) as HTMLElement;
    const lastClone = originalCards[originalCards.length - 1].cloneNode(true) as HTMLElement;
    firstClone.classList.add('clone');
    lastClone.classList.add('clone');

    carousel.appendChild(firstClone);
    carousel.insertBefore(lastClone, originalCards[0]);

    const allCards = Array.from(carousel.children) as HTMLElement[];
    const totalCards = allCards.length;

    // 2. Posição inicial (1° real item)
    carousel.style.transition = 'none';
    carousel.style.transform = `translateX(-${cardWidth * currentIndex}px)`;

    const moveToIndex = (index: number) => {
      carousel.style.transition = 'transform 0.5s ease-in-out';
      carousel.style.transform = `translateX(-${cardWidth * index}px)`;
    };

    nextBtn.addEventListener('click', () => {
      if (currentIndex >= totalCards - 1) return;
      currentIndex++;
      moveToIndex(currentIndex);
    });

    prevBtn.addEventListener('click', () => {
      if (currentIndex <= 0) return;
      currentIndex--;
      moveToIndex(currentIndex);
    });

    carousel.addEventListener('transitionend', () => {
      const currentSlide = allCards[currentIndex];
      if (currentSlide.classList.contains('clone')) {
        carousel.style.transition = 'none';
        if (currentIndex === totalCards - 1) {
          currentIndex = 1;
        } else if (currentIndex === 0) {
          currentIndex = totalCards - 2;
        }
        carousel.style.transform = `translateX(-${cardWidth * currentIndex}px)`;
      }
    });
  }
}
