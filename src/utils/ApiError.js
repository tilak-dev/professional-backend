class ApiError extends Error {
  constructor(
    message,
    statusCode = 500,
    errors = [],
    stack, 
    data = null
  ){
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.data = data;
    this.success = false;
    if(stack){
      this.stack = stack;
    }else{
      Error.captureStackTrace(this, this.constructor);
    }
  }
}


export { ApiError}