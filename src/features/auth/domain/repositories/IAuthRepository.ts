import { User } from '../entities/User';

export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  register(email: string, password: string, username: string): Promise<User>;
  getCurrentUser(): Promise<User | null>;
}