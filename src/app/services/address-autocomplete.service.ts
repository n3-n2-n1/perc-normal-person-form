import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, debounceTime, switchMap, of } from 'rxjs';
import { SelectOption } from '../types/types';

export interface NominatimResult {
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    'ISO3166-2-lvl4'?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AddressAutocompleteService {

  constructor(private http: HttpClient) {}

  searchAddresses(query: string, country: string = 'Argentina'): Observable<SelectOption[]> {
    if (!query || query.length < 3) {
      return of([]);
    }

    const url = `https://nominatim.openstreetmap.org/search`;
    const params = {
      q: `${query}, ${country}`,
      format: 'json',
      addressdetails: '1',
      limit: '10',
      countrycodes: 'AR',
      'accept-language': 'es'
    };

    return this.http.get<NominatimResult[]>(url, { params }).pipe(
      map(results => {
        return results.map(result => ({
          value: result.display_name,
          label: this.formatAddress(result)
        }));
      })
    );
  }

  private formatAddress(result: NominatimResult): string {
    const address = result.address;
    const parts: string[] = [];

    // Número + calle
    if (address.house_number && address.road) {
      parts.push(`${address.road} ${address.house_number}`);
    } else if (address.road) {
      parts.push(address.road);
    }

    // Ciudad/Localidad
    if (address.city) {
      parts.push(address.city);
    } else if (address.town) {
      parts.push(address.town);
    } else if (address.village) {
      parts.push(address.village);
    }

    // Provincia
    if (address.state) {
      parts.push(address.state);
    }

    // Código postal
    if (address.postcode) {
      parts.push(`CP: ${address.postcode}`);
    }

    return parts.length > 0 ? parts.join(', ') : result.display_name;
  }
}