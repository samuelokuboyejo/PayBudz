import { IsNotEmpty, IsAlphanumeric, Length } from 'class-validator';

export class CheckUsernameDto {
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(3, 20)
  username: string;
}
