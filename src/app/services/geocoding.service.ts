import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  constructor(private http: HttpClient) {}

  // Geocodificación inversa: de lat/lng a ciudad
  reverseGeocode(lat: number, lng: number): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    return this.http.get<any>(url);
  }

  // Geocodificación directa: de dirección a lat/lng
  geocode(city: string, street: string, number: string): Observable<any[]> {
    const query = encodeURIComponent(`${street} ${number}, ${city}, Colombia`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
    return this.http.get<any[]>(url);
  }
}