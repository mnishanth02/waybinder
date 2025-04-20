export class HttpException extends Error {
  status: number;
  cause?: unknown;

  constructor(status: number, options?: { cause?: unknown; message?: string }) {
    super(options?.message || "HttpException");
    this.status = status;
    this.cause = options?.cause;
    Object.setPrototypeOf(this, HttpException.prototype);
  }
}
