export class NotFound extends Error {
  constructor(id, model) {
    super(`${model} ${id} not found`);
    this.name = 'NotFound';
    this.statusCode = 404;
  }
}