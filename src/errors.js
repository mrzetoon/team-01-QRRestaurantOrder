'use strict';
// One error type for rule violations; the web layer turns `status` into the HTTP code.
class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
module.exports = { AppError };
