export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly success: boolean;
  public readonly errors: any[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errors: any[] = [],
    isOperational = true,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
