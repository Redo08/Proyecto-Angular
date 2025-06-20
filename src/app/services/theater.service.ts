import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Theater } from '../models/theater.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TheaterService {
  constructor(private http: HttpClient) { } // Se le esta inyectando un servicio HTTP
  list(): Observable<Theater[]> {
    return this.http.get<Theater[]>(`${environment.url_ms_cinema}/theaters`);
  }
  view(id: number):Observable<Theater> {
    return this.http.get<Theater>(`${environment.url_ms_cinema}/theaters/${id}`);
  }
  create(newTheater: Theater):Observable<Theater> {
    delete newTheater.id;
    return this.http.post<Theater>(`${environment.url_ms_cinema}/theaters`,newTheater);
  }
  update(theTheater: Theater):Observable<Theater> {
    return this.http.put<Theater>(`${environment.url_ms_cinema}/theaters/${theTheater.id}`,theTheater);
  }

  delete(id: number) {
    return this.http.delete<Theater>(`${environment.url_ms_cinema}/theaters/${id}`);
  }


}
