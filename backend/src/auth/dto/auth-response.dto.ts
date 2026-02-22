export class AuthResponseDto {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: Date;
}

export class LoginResponseDto {
  user: AuthResponseDto;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}
