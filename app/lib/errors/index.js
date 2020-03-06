export class SecurityError extends Error {
    constructor(message, cause) {
        super(message);
        this.cause = cause;
    }
}

export class NetworkError extends Error{
    constructor(message, cause) {
        super(message);
        this.cause = cause;
    }
}