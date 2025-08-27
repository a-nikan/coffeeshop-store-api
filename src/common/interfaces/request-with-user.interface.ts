import { Request } from 'express';
// We'll need a type for our clean user object. Let's define it here.
// This should match the object returned by your JwtStrategy's validate method.
interface UserPayload {
  id: number;
  email: string;
  role: string;
  // Add other fields if your payload includes them
}

export interface RequestWithUser extends Request {
  user: UserPayload;
}
