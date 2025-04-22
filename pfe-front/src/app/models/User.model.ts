// src/app/models/user.model.ts
export enum Role {
  OPERATEUR = 'OPERATEUR',
  SUPERVISEUR = 'SUPERVISEUR',
  ADMIN = 'ADMIN'
}

export interface User {
  id?: number;
  role: string;
  firstname?: string;
  lastname?: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
export interface login {
  username: string;
  password: string;
}