export interface Task {
    id?: number;
    projectId: number;
    title: string;
    description?: string;
    status?: 'todo' | 'in-progress' | 'done';
    priority?: 'low' | 'normal' | 'high';
    assigneeId?: number;
    dueDate?: Date;
    orderIndex?: number;
    created_at?: Date;
    updated_at?: Date;
}
