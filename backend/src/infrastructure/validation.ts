import ApiError from "./apiError.ts";

interface TaskData {
  title?: string;
  date?: string;
  location?: string;
  capacity?: number;
}

export function validateTask(data: TaskData) {
  const errors: string[] = [];

  if (!data.title || data.title.length < 3) {
    errors.push("title min 3 chars");
  }

  if (!data.date || isNaN(Date.parse(data.date))) {
    errors.push("invalid date");
  }

  if (!data.location) {
    errors.push("location required");
  }

  if (data.capacity === undefined || data.capacity <= 0) {
    errors.push("capacity must be > 0");
  }

  if (errors.length) {
    throw new ApiError("VALIDATION_ERROR", "Invalid request body", 400, errors);
  }
}