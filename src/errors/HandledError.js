class HandledError extends Error {
  constructor(codeName, message = '') {
    super(message);
    this.name = codeName;
    this.statusCode = 400;
  }
}

module.exports = HandledError;
