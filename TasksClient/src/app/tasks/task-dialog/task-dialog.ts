import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../tasks.service';
import { Task } from '../../shared/models/task';
import { TaskComment } from '../../shared/models/comment';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.css'
})

export class TaskDialog implements OnInit {
  private tasksService = inject(TasksService);
  private toast = inject(ToastService);

  projectId = input.required<number>();
  taskToEdit = input<Task | null>(null);

  initialStatus = input<string>('todo');

  status = signal<'todo' | 'in-progress' | 'done'>('todo');
  priority = signal<'low' | 'normal' | 'high'>('normal');

  closed = output<void>();
  saved = output<void>();

  title = signal('');
  description = signal('');
  isSaving = signal(false);

  comments = signal<TaskComment[]>([]);
  newCommentBody = signal('');
  isLoadingComments = signal(false);

  ngOnInit() {
    const task = this.taskToEdit();

    if (task && task.id) {
      this.loadComments(task.id);
      this.title.set(task.title);
      this.description.set(task.description || '');
      this.status.set(task.status || 'todo');
      this.priority.set(task.priority || 'normal');
    } else {
      const s = this.initialStatus() as 'todo' | 'in-progress' | 'done';
      this.status.set(s);
    }
  }


  getStatusLabel(): string {
    const s = this.status();
    switch (s) {
      case 'todo': return 'לביצוע';
      case 'in-progress': return 'בעבודה';
      case 'done': return 'הושלם';
      default: return '';
    }
  }


  loadComments(taskId: number) {
    this.isLoadingComments.set(true);
    this.tasksService.getComments(taskId).subscribe({
      next: (data) => {
        this.comments.set(data);
        this.isLoadingComments.set(false);
      },
      error: () => this.isLoadingComments.set(false)
    });
  }


  submitComment() {
    const body = this.newCommentBody().trim();
    const taskId = this.taskToEdit()?.id;

    if (!body || !taskId) return;

    this.tasksService.addComment(taskId, body).subscribe({
      next: (newComment) => {
        this.comments.update(all => [newComment, ...all]);
        this.newCommentBody.set('');
      }
    });
  }

  save() {
    const pId = this.projectId();
    const taskName = this.title().trim();

    if (!taskName || pId === null || pId === undefined) {
      console.error('Missing data:', { title: taskName, projectId: pId });
      return;
    }

    this.isSaving.set(true);

    const taskData = {
      projectId: Number(pId),
      title: taskName,
      description: this.description().trim() || "",
      status: this.status(),
      priority: this.priority()
    };

    const taskToEdit = this.taskToEdit();

    const action$ = (taskToEdit && taskToEdit.id)
      ? this.tasksService.updateTask(taskToEdit.id, taskData)
      : this.tasksService.createTask(taskData);

    action$.subscribe({
      next: (response) => {
        this.isSaving.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toast.show('אופס! משהו השתבש בשמירה', 'error');
      }
    });
  }
}