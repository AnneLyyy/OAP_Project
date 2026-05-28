import ApiError from "./apiError.ts";

interface TaskData {
  title?: string;
  date?: string;
  location?: string;
  capacity?: number;
  description?: string;
}

const allowedFields = new Set([
  "title",
  "date",
  "location",
  "capacity",
  "description"
]);

function validateUnknownFields(data: Record<string, unknown>, errors: string[]) {
  for (const key of Object.keys(data)) {
    if (!allowedFields.has(key)) {
      errors.push(`unknown field: ${key}`);
    }
  }
}

function normalizeCapacity(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return Number.NaN;
}

export function validateTask(data: TaskData) {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    throw new ApiError("VALIDATION_ERROR", "Invalid request body", 400, ["body must be an object"]);
  }

  validateUnknownFields(data as Record<string, unknown>, errors);

  if (!data.title || data.title.trim().length < 3) {
    errors.push("title min 3 chars");
  } else if (data.title.trim().length > 60) {
    errors.push("title max 60 chars");
  }

  if (!data.date || isNaN(Date.parse(data.date))) {
    errors.push("invalid date");
  }

  if (!data.location || data.location.trim().length === 0) {
    errors.push("location required");
  } else if (data.location.trim().length > 80) {
    errors.push("location max 80 chars");
  }

  const capacity = normalizeCapacity(data.capacity);

  if (capacity === undefined || !Number.isInteger(capacity) || capacity <= 0) {
    errors.push("capacity must be positive integer");
  }

  if (data.description !== undefined && typeof data.description !== "string") {
    errors.push("description must be string");
  }

  if (errors.length) {
    throw new ApiError("VALIDATION_ERROR", "Invalid request body", 400, errors);
  }
}

export function validatePartialTask(data: TaskData) {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    throw new ApiError("VALIDATION_ERROR", "Invalid request body", 400, ["body must be an object"]);
  }

  validateUnknownFields(data as Record<string, unknown>, errors);

  if (data.title !== undefined && data.title.trim().length < 3) {
    errors.push("title min 3 chars");
  } else if (data.title !== undefined && data.title.trim().length > 60) {
    errors.push("title max 60 chars");
  }

  if (data.date !== undefined && isNaN(Date.parse(data.date))) {
    errors.push("invalid date");
  }

  if (data.location !== undefined && data.location.trim().length === 0) {
    errors.push("location cannot be empty");
  } else if (data.location !== undefined && data.location.trim().length > 80) {
    errors.push("location max 80 chars");
  }

  const capacity = normalizeCapacity(data.capacity);

  if (data.capacity !== undefined && (capacity === undefined || !Number.isInteger(capacity) || capacity <= 0)) {
    errors.push("capacity must be positive integer");
  }

  if (data.description !== undefined && typeof data.description !== "string") {
    errors.push("description must be string");
  }

  if (errors.length) {
    throw new ApiError("VALIDATION_ERROR", "Invalid request body", 400, errors);
  }
}
