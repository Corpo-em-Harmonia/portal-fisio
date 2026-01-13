
import { Injectable } from '@angular/core';
import { Lead } from '../models/lead';
import { BaseService } from '../../core/services/base.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class LeadService extends BaseService<Lead> {

    constructor(override http: HttpClient) {
        super(http);
    }

    protected override pathUrl: string = 'leads';

    salvarLead(lead: Lead): Observable<Lead> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.createLead(lead);
    }

    
}
