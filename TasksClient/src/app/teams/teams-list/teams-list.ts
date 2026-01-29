import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsService } from '../teams.service';
import { Team } from '../../shared/models/team';
import { Router } from '@angular/router';
import { TeamCreate } from '../team-create/team-create';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [CommonModule, TeamCreate, FormsModule],
  templateUrl: './teams-list.html',
  styleUrl: './teams-list.css'
})

export class TeamsList implements OnInit {
  private teamsService = inject(TeamsService);
  private router = inject(Router);

  teams = signal<Team[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  searchQuery = signal<string>('');

  // פילטר צוותים לפי החיפוש
  filteredTeams = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.teams();
    return this.teams().filter(t => t.name?.toLowerCase().includes(query));
  });

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.isLoading.set(true);
    this.teamsService.getTeams().subscribe({
      next: (data) => {
        this.teams.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openCreateModal() {
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onTeamCreated() {
    this.closeModal();
    this.loadTeams();
  }


  viewProjects(teamId: number) {
    this.router.navigate(['/projects'], { queryParams: { teamId: teamId } });
  }


}