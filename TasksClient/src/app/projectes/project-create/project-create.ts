import { Component, inject, input, output, signal } from '@angular/core';
import { ProjectsService } from '../projects.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-create.html',
  styleUrl: './project-create.css',
})
export class ProjectCreate {
  private projectsService = inject(ProjectsService);
  private toast = inject(ToastService);

  teamId = input.required<number>();

  projectCreated = output<void>();
  cancel = output<void>();

  projectName = signal('');
  isSaving = signal(false);

  save() {
    this.isSaving.set(true);
    this.projectsService.createProject(this.projectName(), this.teamId()).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.projectName.set('');
        this.projectCreated.emit();
      },
      error: () => {
        this.isSaving.set(false);
        this.toast.show('שגיאה ביצירת הפרויקט', 'error')
      }
    });
  }
}
