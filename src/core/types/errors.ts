export class AppError extends Error {
    constructor(
      message: string,
      public code: string,
      public statusCode: number = 500
    ) {
      super(message);
      this.name = 'AppError';
    }
  }
  
  export class ValidationError extends AppError {
    constructor(message: string) {
      super(message, 'VALIDATION_ERROR', 400);
      this.name = 'ValidationError';
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(resource: string, id: number | string) {
      super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
      this.name = 'NotFoundError';
    }
  }
  
  export class ConflictError extends AppError {
    constructor(message: string) {
      super(message, 'CONFLICT_ERROR', 409);
      this.name = 'ConflictError';
    }
  }
  
  export class InternalServerError extends AppError {
    constructor(message: string = 'Internal server error') {
      super(message, 'INTERNAL_ERROR', 500);
      this.name = 'InternalServerError';
    }
  }