export interface TaskDto {
  id: string;
  title: string;
  date: string;
  location: string;
  capacity: number;
  description?: string;
}

export interface CreateTaskDto {
  title: string;
  date: string;
  location: string;
  capacity: number;
  description?: string;
}

export type UpdateTaskDto = Partial<CreateTaskDto>;

export interface SuccessResponseDto<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponseDto {
  success: false;
  status: number;
  code: string;
  message: string;
  details: string[];
}
