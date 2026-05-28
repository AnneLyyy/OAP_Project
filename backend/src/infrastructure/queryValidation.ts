import ApiError from "./apiError.ts";

export const TASK_SORT_FIELDS = new Set(["title", "date", "location", "capacity"]);
export const SORT_DIRECTIONS = new Set(["asc", "desc"]);

export function parsePositiveInt(value: unknown, field: string, fallback: number): number {
  if (value === undefined || value === null || value === "") return fallback;

  const number = Number(value);

  if (!Number.isInteger(number) || number < 1) {
    throw new ApiError("VALIDATION_ERROR", "Invalid query parameter", 400, [`${field} must be positive integer`]);
  }

  return number;
}

export function validateSort(sortBy?: string, sortDir?: string) {
  if (sortBy !== undefined && !TASK_SORT_FIELDS.has(sortBy)) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Invalid sort field",
      400,
      ["sortBy must be one of: title, date, location, capacity"]
    );
  }

  if (sortDir !== undefined && !SORT_DIRECTIONS.has(sortDir)) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Invalid sort direction",
      400,
      ["sortDir must be asc or desc"]
    );
  }
}

export function validateDateRange(from?: string, to?: string) {
  if (!from || !to) {
    throw new ApiError("VALIDATION_ERROR", "from and to required", 400, ["from and to query parameters are required"]);
  }

  if (Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to))) {
    throw new ApiError("VALIDATION_ERROR", "Invalid date range", 400, ["from and to must be valid dates"]);
  }

  if (from > to) {
    throw new ApiError("VALIDATION_ERROR", "Invalid date range", 400, ["from cannot be greater than to"]);
  }
}
