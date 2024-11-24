import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateCardDto {



    @IsNotEmpty()
    @IsNumber()
    cardNumber: number;
    @IsNotEmpty()
    userId: number;
    @IsNotEmpty()
    expirationDate: string;
    @IsNotEmpty()
    @IsNumber()
    cvc: number;
    @IsNotEmpty()
    holderName: string;
    @IsNotEmpty()
    address1: string;
    @IsNotEmpty()
    address2: string;

    
}
