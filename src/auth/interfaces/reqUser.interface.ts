import { Request } from 'express';

export interface ReqUser extends Request {
  user: { email: string; password: string };
}

export interface ReqJwt extends Request {
  user: { id: number; role: string; name: string; image: number, country: number };
}
