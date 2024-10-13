class ApiResponse {
  constructor(statusCode, data, success=true, message = "successfully"){
    this.statusCode = statusCode < 400;
    this.data = data;
    this.success = success;
    this.message = message;
  }
}