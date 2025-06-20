// src/app/services/theme.service.ts
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  // BehaviorSubject guarda o estado atual (true para escuro, false para claro)
  // e notifica todos que se inscreverem quando ele muda.
  public isDarkMode$ = new BehaviorSubject<boolean>(false);

  constructor(rendererFactory: RendererFactory2) {
    // Usamos Renderer2 para manipular o DOM de forma segura (adicionar/remover classe no body)
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadInitialTheme();
  }

  /**
   * Carrega o tema salvo no localStorage ao iniciar a aplicação.
   */
  private loadInitialTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    this.isDarkMode$.next(isDark); // Atualiza o BehaviorSubject
    this.updateBodyClass(isDark); // Aplica a classe ao body
  }

  /**
   * Alterna o tema atual.
   */
  toggleTheme(): void {
    const newThemeState = !this.isDarkMode$.value;
    this.isDarkMode$.next(newThemeState); // Atualiza o estado
    localStorage.setItem('theme', newThemeState ? 'dark' : 'light'); // Salva no localStorage
    this.updateBodyClass(newThemeState); // Atualiza a classe no body
  }

  /**
   * Adiciona ou remove a classe 'dark-theme' do elemento <body>.
   * @param isDark O estado do tema escuro.
   */
  private updateBodyClass(isDark: boolean): void {
    if (isDark) {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }
}