export class AuthResponseDto {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: Date;
}

export class LoginResponseDto {
  user: AuthResponseDto;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}
