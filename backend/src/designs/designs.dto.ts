import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateDesignDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNotEmpty()
  photos: any;

  @IsObject()
  frameConfig: any;

  @IsObject()
  textCustomization: any;
}

export class UpdateDesignDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  photos?: any;

  @IsObject()
  @IsOptional()
  frameConfig?: any;

  @IsObject()
  @IsOptional()
  textCustomization?: any;
}

export class DesignResponseDto {
  id: string;
  userId: string;
  name?: string;
  photos: any;
  frameConfig: any;
  textCustomization: any;
  createdAt: Date;
}
