import { IsNotEmpty, IsAlphanumeric, Length } from 'class-validator';

export class UserNameUpdateRequestDTO {
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(3, 20)
  username: string;
}
