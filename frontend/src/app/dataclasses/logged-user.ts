import { User } from './user';

export class LoggedUser {
  public user: User
  public token: string;
  public redirect?: boolean;
  public socialId?: string;
}
