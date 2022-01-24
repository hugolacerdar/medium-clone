export interface JWTPayload {
  id: string;
  username: string;
  email: string;
  iat: number;
}
