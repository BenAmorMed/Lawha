import {
  IsInt,
  IsString,
  Min,
  Max,
  Length,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @Length(5, 100)
  title: string;

  @IsString()
  @Length(10, 1000)
  comment: string;

  @IsUUID()
  productId: string;

  @IsUUID()
  @IsOptional()
  orderId?: string;
}

export class UpdateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @Length(5, 100)
  @IsOptional()
  title?: string;

  @IsString()
  @Length(10, 1000)
  @IsOptional()
  comment?: string;
}

export class ReviewResponseDto {
  id: string;
  rating: number;
  title: string;
  comment: string;
  userId: string;
  userEmail?: string;
  productId: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}
