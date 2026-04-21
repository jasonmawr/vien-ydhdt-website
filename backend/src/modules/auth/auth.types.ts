export interface User {
  id: string;
  username: string;
  role: "ADMIN" | "DOCTOR";
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}
