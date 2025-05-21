import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { User } from '../../../Models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
user: User = { username: '', email: '', password: '', role: 'user' };
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

  onSubmit() {
    console.log('Formulário enviado', this.user);

    this.apiService.register(this.user).subscribe({
      next: (response) => {
        console.log('Usuário cadastrado com sucesso:', response);
        this.successMessage = 'Cadastro realizado com sucesso! Redirecionando...';
        this.errorMessage = ''; // limpa qualquer erro anterior

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000); // redireciona após 2 segundos
      },
      error: (error) => {
        console.error('Erro no cadastro', error);
        this.errorMessage = 'Erro ao cadastrar. Verifique os dados.';
        this.successMessage = ''; // limpa qualquer sucesso anterior
      }
    });
  }

}
