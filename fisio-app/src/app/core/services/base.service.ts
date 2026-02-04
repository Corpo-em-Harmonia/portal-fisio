
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export abstract class BaseService<T> {

    protected constructor(protected http: HttpClient) { }
    protected abstract pathUrl: string;

    geFullUrl(): string {
        const baseUrl = 'http://localhost:8080/api/public';

        return `${baseUrl}/${this.pathUrl}`;
    }

    createLead(lead: T): Observable<T> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http.post<T>(this.geFullUrl(), lead, { headers });
    }


}   