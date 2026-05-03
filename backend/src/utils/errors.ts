export class HTTPError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'HTTPError'
  }
}

export class ValidationError extends HTTPError {
  constructor(public readonly errors: string[]) {
    super(400, errors.join(' | '))
    this.name = 'ValidationError'
  }
}
