const Business = {
    SUCCESS: {
        code: 200,
        message: 'success',
    },
    ERROR: {
        code: 500,
        message: 'error',
    },
}

export class ApiRes<T> {
  static ok<T>(data: T) {
    return {
      data,
      code: Business.SUCCESS.code,
      message: Business.SUCCESS.message,
    }
  }
  static fail(data = null, message: string, code: number = Business.ERROR.code) {
    return {
      data,
      code,
      message: message || Business.ERROR.message,
    }
  }
}