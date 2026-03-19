export interface Task {
  id: string;
  title: string;
  date: string;
  location: string;
  capacity: number;
  description?: string;
}