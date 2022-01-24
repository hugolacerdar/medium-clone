import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDTO {
  @IsEmail()
  readonly email: string;

  readonly username: string;

  readonly bio: string;

  readonly image: string;
}
