import { User } from '@prisma/client';

export class TokenResponseDto {
  user!: Partial<User>;
  access_token!: string;
  message!: string;
}