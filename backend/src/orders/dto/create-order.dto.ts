import { IsUUID, IsOptional, IsObject, IsString, IsEmail } from 'class-validator';

export class CreateOrderDto {
    @IsUUID()
    productSizeId: string;

    @IsOptional()
    @IsUUID()
    frameOptionId?: string;

    @IsObject()
    designJson: object;

    @IsString()
    previewUrl: string;

    // Adresse livraison
    @IsString()
    shippingFirstName: string;

    @IsString()
    shippingLastName: string;

    @IsString()
    shippingAddress: string;

    @IsString()
    shippingCity: string;

    @IsString()
    shippingPostalCode: string;

    @IsString()
    shippingPhone: string;

    // Guest (si non connecté)
    @IsOptional()
    @IsEmail()
    guestEmail?: string;
}

export class OrderCreatedResponseDto {
    orderId: string;
    total: number;
    status: string;
}
