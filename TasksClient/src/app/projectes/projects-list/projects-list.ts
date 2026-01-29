import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ProjectCreate } from '../project-create/project-create';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectsService } from '../projects.service';
import { Project } from '../../shared/models/project';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule, ProjectCreate, FormsModule],
  templateUrl: './projects-list.html',
  styleUrl: './projects-list.css',
})

export class ProjectsList implements OnInit {
  private projectsService = inject(ProjectsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  projects = signal<Project[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal(true);
  showModal = signal(false);

  currentTeamId = signal<number | null>(null);

  // פילטר פרויקטים לפי החיפוש
  filteredProjects = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.projects();
    return this.projects().filter(p => p.name?.toLowerCase().includes(query));
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = Number(params['teamId']);
      if (id) {
        this.currentTeamId.set(id);
        this.loadProjects(id);
      } else
        this.router.navigate(['/teams']);
    });
  }

  loadProjects(teamId: number) {
    this.isLoading.set(true);
    this.projectsService.getProjects(teamId).subscribe({
      next: (data) => {
        this.projects.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openTasks(projectId: number) {
    const teamId = this.currentTeamId();
    this.router.navigate(['/tasks'], { queryParams: { projectId, teamId } });
  }

  onProjectCreated() {
    this.showModal.set(false);
    const id = this.currentTeamId();
    if (id != null)
      this.loadProjects(id);
  }
}