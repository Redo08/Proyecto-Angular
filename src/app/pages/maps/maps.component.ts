import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    // Coordenadas por defecto (Bogotá)
    const lat = 4.60971;
    const lng = -74.08175;

    // Inicializa el mapa
    const map = L.map('map-canvas').setView([lat, lng], 12);

    // Capa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Marcador con popup
    L.marker([lat, lng]).addTo(map)
      .bindPopup('<b>Argon Dashboard</b><br>A beautiful Dashboard for Bootstrap 4. It is Free and Open Source.')
      .openPopup();
  }

}
