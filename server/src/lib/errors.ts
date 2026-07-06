export class AppError extends Error{
    constructor(
        public readonly statusCode:number,
        message:string
    ){
        super(message);
        Object.setPrototypeOf(this,new.target.prototype);
        this.name = this.constructor.name;
    }
}

//400 - the client sent bad data
export class ValidationError extends AppError{
    constructor(message: string){
        super(400, message);
    }
}

//401 - not logged in / token invalid
export class UnauthorizedError extends AppError{
    constructor(message: string){
        super(401, message)
    }
}

//403 - logged in but not allowed to do this
export class ForbiddenError extends AppError{
    constructor(message= "Forbidden"){
        super(403,message);
    }
}

// 404 - resource doesn't exist
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}
 
// 409 - conflict, e.g. email already registered
export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}
 
// 429 - rate limit hit
export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests") {
    super(429, message);
  }
}
 
// 402 - not enough credits
export class InsufficientCreditsError extends AppError {
  constructor() {
    super(402, "Insufficient credits");
  }
}