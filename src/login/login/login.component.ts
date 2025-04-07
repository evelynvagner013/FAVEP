import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, NgxMaskDirective, NgxMaskPipe, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isFlipped = false;

}
