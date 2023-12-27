export class HandledError extends Error {
  constructor(codeName, message = '', statusCode = 400) {
    super();
    this.name = codeName;
    this.message = message;
    this.statusCode = statusCode;
  }
}
