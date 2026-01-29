import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../environments/environment";
import { Project } from "../shared/models/project";
import { map, Observable, tap } from "rxjs";


@Injectable({
    providedIn: 'root'
})

export class ProjectsService {
    private API_URL = `${environment.apiUrl}/api/projects`;
    private http = inject(HttpClient);

    private _projects = signal<Project[]>([]);
    public projects = this._projects.asReadonly();

    getProjects(teamId?: number) {
        return this.http.get<Project[]>(this.API_URL).pipe(
            tap(data => this._projects.set(data)),
            map((projects: Project[]) => {
                if (!teamId) return projects;
                return projects.filter((p: any) => {
                    const pTeamId = p.team_id || p.teamId;
                    return Number(pTeamId) === Number(teamId);
                });
            })
        );
    }


    createProject(name: string, teamId: number): Observable<Project> {
        return this.http.post<Project>(this.API_URL, { name: name, teamId: Number(teamId) }).pipe(
            tap(newProject => {
                this._projects.update(prev => [...prev, newProject]);
            })
        );
    }


    isNameTaken(name: string, teamId: number): boolean {
        return this.projects().some(p => p.name?.toLowerCase() === name.toLowerCase() && p.teamId === teamId);
    }
}