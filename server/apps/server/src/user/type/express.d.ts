import type { TokenPayload } from '@en/common';
import type { Request } from 'express';

declare module 'express' {
  interface Request extends ExpressRequest {
    user: TokenPayload;
  }
}