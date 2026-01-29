import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../shared/models/task';
import { TasksService } from '../tasks.service';
import { TaskComment } from '../../shared/models/comment';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css'
})

export class TaskCard {
  private tasksService = inject(TasksService);
  private toast = inject(ToastService);

  task = input.required<Task>();
  taskClicked = output<Task>();
  statusChanged = output<void>();

  showComments = signal(false);
  comments = signal<TaskComment[]>([]);
  isLoading = signal(false);
  confirmDelete = signal(false);


  markAsDone(event: Event) {
    event.stopPropagation();
    const taskId = this.task().id;
    if (!taskId) return;

    this.tasksService.updateTask(taskId, { status: 'done' }).subscribe({
      next: () => {
        this.toast.show('המשימה הושלמה בהצלחה! 🎉');
      },
      error: () => this.toast.show('שגיאה בעדכון המשימה', 'error')
    });
  }


  onCardClick() {
    this.taskClicked.emit(this.task());
  }

  onDelete(event: Event) {
    event.stopPropagation();
    const taskId = this.task().id;
    if (!taskId) return;

    this.tasksService.deleteTask(taskId).subscribe({
      next: () => {
        this.toast.show('המשימה נמחקה בהצלחה');
        this.confirmDelete.set(false);
      },
      error: (err) => {
        console.error('מחיקה נכשלה:', err);
        this.toast.show('לא ניתן למחוק את המשימה', 'error');
        this.confirmDelete.set(false);
      }
    });
  }

  getPriorityClass() {
    return `priority-${this.task().priority}`;
  }

  getStatusClass() {
    return `status-${this.task().status}`;
  }


  toggleComments(event: Event) {
    event.stopPropagation();
    this.showComments.update(v => !v);

    if (this.showComments() && this.comments().length === 0) {
      this.loadComments();
    }
  }


  loadComments() {
    const taskId = this.task().id;
    if (!taskId) return;

    this.isLoading.set(true);
    this.tasksService.getComments(taskId).subscribe({
      next: (data) => {
        this.comments.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  askToDelete(event: Event) {
    event.stopPropagation();
    this.confirmDelete.set(true);
  }
}