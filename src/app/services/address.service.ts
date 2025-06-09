import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Address } from '../models/address.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  constructor(private http: HttpClient) { }

  getAddressByUserId(userId:number):Observable<Address>{
    return this.http.get<Address>(`${environment.url_ms_socket}/api/addresses/user/${userId}`);
  }
  createAddress(userId: number, data: { street: string; number: string; latitude?: number; longitude?: number }): Observable<Address> {
    return this.http.post<Address>(`${environment.url_ms_socket}/api/addresses/user/${userId}`, data);
  }

  updateAddress(address: Address): Observable<Address> {
    return this.http.put<Address>(`${environment.url_ms_socket}/api/addresses/${address.id}`, {
      street: address.street,
      number: address.number,
      latitude: address.latitude,
      longitude: address.longitude
    });
  }
  deleteAddress(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.url_ms_socket}/api/addresses/${id}`);
  }
}
