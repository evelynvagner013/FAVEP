import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';  // Para usar o ngModel

@Component({
  selector: 'app-registros',
  standalone: true, // Usando standalone component
  imports: [CommonModule, ReactiveFormsModule, FormsModule], // Importando os módulos necessários
  templateUrl: './registros.component.html',
  styleUrls: ['./registros.component.css']
})
export class RegistrosComponent {
  // Formulário para a Propriedade
  propriedadeForm: FormGroup;

  // Variável para controlar qual formulário será exibido
  formSelecionado: string = 'propriedade'; // Valor inicial (default)

  constructor(private fb: FormBuilder) {
    this.propriedadeForm = this.fb.group({
      nome: ['', Validators.required],
      localizacao: ['', Validators.required],
      tamanho: ['', [Validators.required, Validators.min(0.1)]],
      cultura: ['', Validators.required],
    });
  }

  // Função chamada quando o formulário é enviado
  onSubmit() {
    if (this.propriedadeForm.valid) {
      console.log('Registro enviado:', this.propriedadeForm.value);
    } else {
      console.log('Formulário inválido');
    }
  }
}
