import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'response_message';

// Controllers just return data and, optionally, describe it:
//   @ResponseMessage('Login successful')
//   login(@Body() dto: LoginDto) { ... }
// ResponseInterceptor reads this via Reflector and does the wrapping --
// no manual createResponse(res, body, message) call to remember.
export const ResponseMessage = (message: string) => SetMetadata(RESPONSE_MESSAGE_KEY, message);
