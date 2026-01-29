import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TeamsService } from '../teams.service';

@Component({
  selector: 'app-team-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-create.html',
  styleUrl: './team-create.css',
})
export class TeamCreate {
  private teamsService = inject(TeamsService);

  teamCreated = output<void>();
  cancel = output<void>();

  teamName = signal('');
  isSubmitting = signal(false);
  errorMessage = signal('');

  onSubmit() {
    const name = this.teamName().trim();

    if (!name) {
      this.errorMessage.set('נא להזין שם לצוות');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.teamsService.createTeam(name).subscribe({
      next: (newTeam) => {
        this.isSubmitting.set(false);
        this.teamName.set('');
        this.teamCreated.emit();
      },
      error: (err) => {
        this.errorMessage.set('חלה שגיאה ביצירת הצוות. נסה שוב.');
        this.isSubmitting.set(false);
      }
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
