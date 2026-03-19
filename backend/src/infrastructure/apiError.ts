export default class ApiError extends Error {
  code: string;
  status: number;
  details: any[];

  constructor(code: string, message: string, status = 400, details: any[] = []) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}