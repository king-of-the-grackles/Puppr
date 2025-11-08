// Custom error classes for better error handling

export class DogAPIError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DogAPIError';
  }
}

export class AnthropicAPIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'AnthropicAPIError';
    this.statusCode = statusCode;
  }
}

export class ProfileGenerationError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'ProfileGenerationError';
    this.cause = cause;
  }
}
