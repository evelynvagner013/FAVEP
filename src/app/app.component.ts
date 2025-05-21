import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ApiService } from '../services/api.service';
import { LoginComponent } from '../Pages/Auth/login/login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  {
  constructor(private api: ApiService) {}

 
}
