import { IsUUID, IsOptional, IsObject, IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class CreateOrderDto {
    @IsUUID()
    productSizeId: string;

    @IsOptional()
    @IsUUID()
    frameOptionId?: string;

    @IsObject()
    designJson: object;

    @IsString()
    @MaxLength(2048)
    previewUrl: string;

    // Adresse livraison
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    shippingFirstName: string;

    @IsString()
    @MinLength(1)
    @MaxLength(100)
    shippingLastName: string;

    @IsString()
    @MinLength(5)
    @MaxLength(255)
    shippingAddress: string;

    @IsString()
    @MinLength(2)
    @MaxLength(100)
    shippingCity: string;

    @IsString()
    @MinLength(3)
    @MaxLength(20)
    shippingPostalCode: string;

    @IsString()
    @MinLength(5)
    @MaxLength(20)
    shippingPhone: string;

    // Guest (si non connecté)
    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    guestEmail?: string;
}

export class OrderCreatedResponseDto {
    orderId: string;
    total: number;
    status: string;
}
