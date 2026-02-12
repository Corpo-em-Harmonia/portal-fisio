
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export abstract class BaseService<T> {
    protected abstract pathUrl: string;
    private readonly baseUrl = API_CONFIG.baseUrl;
    private readonly headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    protected constructor(protected http: HttpClient) {}

    protected getFullUrl(): string {
        return `${this.baseUrl}/${this.pathUrl}`;
    }

    protected getById(id: number | string): Observable<T> {
        return this.http.get<T>(`${this.getFullUrl()}/${id}`);
    }

    protected getAll(): Observable<T[]> {
        return this.http.get<T[]>(this.getFullUrl());
    }

    protected create(entity: T): Observable<T> {
        return this.http.post<T>(this.getFullUrl(), entity, { headers: this.headers });
    }

    protected update(id: number | string, entity: Partial<T>): Observable<T> {
        return this.http.put<T>(`${this.getFullUrl()}/${id}`, entity, { headers: this.headers });
    }

    protected delete(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.getFullUrl()}/${id}`);
    }
}   