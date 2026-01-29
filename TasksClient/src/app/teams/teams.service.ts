import { HttpClient } from '@angular/common/http';
import { Team } from '../shared/models/team';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';


@Injectable({
    providedIn: 'root'
})

export class TeamsService {
    private API_URL = `${environment.apiUrl}/api/teams`;
    private http = inject(HttpClient);

    getTeams() {
        return this.http.get<Team[]>(this.API_URL);
    }

    createTeam(name: string) {
        return this.http.post<Team>(this.API_URL, { name });
    }

    isNameTaken(teams: Team[], name: string): boolean {
        return teams.some(team => team.name?.toLowerCase() === name.toLowerCase());
    }
}