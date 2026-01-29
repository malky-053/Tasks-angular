import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TasksService } from '../tasks.service';
import { TaskCard } from '../task-card/task-card';
import { TaskDialog } from '../task-dialog/task-dialog';
import { Task } from '../../shared/models/task';
import { ProjectsService } from '../../projectes/projects.service';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, TaskCard, TaskDialog, FormsModule, DragDropModule],
  templateUrl: './task-board.html',
  styleUrl: './task-board.css'
})

export class TaskBoard implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tasksService = inject(TasksService);
  private projectsService = inject(ProjectsService);

  private toast = inject(ToastService);

  tasks = computed(() => this.tasksService.tasks());

  projectId = signal<number | null>(null);
  teamId = signal<number | null>(null);
  isLoading = signal(true);

  selectedTask = signal<Task | null>(null);
  showDialog = signal(false);

  initialStatus = signal<string>('todo');

  searchQuery = signal<string>('');

  sortByPriority = signal<{ [key: string]: boolean }>({
    'todo': false,
    'in-progress': false,
    'done': false
  });

  private getPriorityValue(priority: string | number | undefined): number {
    if (typeof priority === 'number') return priority;
    const priorityMap: { [key: string]: number } = {
      'high': 3,
      'normal': 2,
      'low': 1,
    };
    return priorityMap[String(priority).toLowerCase()] || 0;
  }

  todoTasks = computed(() => {
    let tasks = this.tasks().filter(t => t.status === 'todo');
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      tasks = tasks.filter(t => t.title?.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query));
    }
    if (this.sortByPriority()['todo']) {
      tasks = tasks.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
    }
    return tasks;
  });

  inProgressTasks = computed(() => {
    let tasks = this.tasks().filter(t => t.status === 'in-progress');
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      tasks = tasks.filter(t => t.title?.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query));
    }
    if (this.sortByPriority()['in-progress']) {
      tasks = tasks.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
    }
    return tasks;
  });

  doneTasks = computed(() => {
    let tasks = this.tasks().filter(t => t.status === 'done');
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      tasks = tasks.filter(t => t.title?.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query));
    }
    if (this.sortByPriority()['done']) {
      tasks = tasks.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
    }
    return tasks;
  });

  toggleSortByPriority(status: string) {
    this.sortByPriority.update(current => ({
      ...current,
      [status]: !current[status]
    }));
  }


  projectName = computed(() => {
    const id = this.projectId();
    if (!id) return 'טוען...';
    const found = this.projectsService.projects().find(p => Number(p.id) === Number(id));
    return found ? found.name : `פרויקט #${id}`;
  });


  openCreateDialog(status: string = 'todo') {
    this.initialStatus.set(status);
    this.selectedTask.set(null);
    this.showDialog.set(true);
  }

  openEditDialog(task: Task) {
    this.selectedTask.set(task);
    this.showDialog.set(true);
  }

  onTaskSaved() {
    this.showDialog.set(false);
    this.loadTasks(this.projectId()!);
  }

  goBackToProjects() {
    const team = this.teamId();
    if (team) {
      this.router.navigate(['/projects'], { queryParams: { teamId: team } });
    } else {
      this.router.navigate(['/projects']);
    }
  }

  ngOnInit() {
    this.projectsService.getProjects().subscribe();

    this.route.queryParams.subscribe(params => {
      const projectId = Number(params['projectId']);
      const teamId = Number(params['teamId']);

      if (projectId) {
        this.projectId.set(projectId);
        if (teamId) {
          this.teamId.set(teamId);
        }
        this.loadTasks(projectId);
      }
    });
  }

  onTaskDropped(event: CdkDragDrop<Task[]>, newStatus: "todo" | "in-progress" | "done" | undefined) {
    if (event.previousContainer === event.container) {
      return;
    }

    const task = event.item.data as Task;

    const previousStatus = task.status;

    task.status = newStatus;

    if (task.id) {
      this.tasksService.updateTask(task.id, { status: newStatus }).subscribe({
        next: () => { },
        error: () => {
          task.status = previousStatus;
          this.toast.show('שגיאה בעדכון הסטטוס', 'error')
        }
      });
    }
  }


  loadTasks(id: number | null = this.projectId()) {
    if (id === null) return;

    this.isLoading.set(true);
    this.tasksService.getTasks(id).subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    });
  }
}