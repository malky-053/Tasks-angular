import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { Task } from '../shared/models/task';
import { TaskComment } from '../shared/models/comment';

@Injectable({
    providedIn: 'root'
})

export class TasksService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/tasks`;

    tasks = signal<Task[]>([]);

    getTasks(projectId: number): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}?projectId=${projectId}`).pipe(
            tap(data => this.tasks.set(data))
        );
    }
    createTask(task: Partial<Task>): Observable<Task> {
        return this.http.post<Task>(this.apiUrl, task);
    }

    updateTask(id: number, task: Partial<Task>): Observable<Task> {
        return this.http.patch<Task>(`${this.apiUrl}/${id}`, task).pipe(
            tap(updatedTask => {
                this.tasks.update(allTasks =>
                    allTasks.map(t => t.id === id ? updatedTask : t)
                );
            })
        );
    }

    deleteTask(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => {
                this.tasks.update(prev => prev.filter(t => t.id !== id));
            })
        );
    }

    getComments(taskId: number): Observable<TaskComment[]> {
        return this.http.get<TaskComment[]>(`${environment.apiUrl}/api/comments`, {
            params: { taskId: taskId.toString() }
        });
    }

    addComment(taskId: number, body: string): Observable<TaskComment> {
        return this.http.post<TaskComment>(`${environment.apiUrl}/api/comments`, {
            body: body,
            taskId: taskId
        });
    }
}