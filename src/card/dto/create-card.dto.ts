import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateCardDto {



    @IsNotEmpty()
    @IsNumber()
    cardNumber: number;
    @IsNotEmpty()
    expirationDate: number;
    @IsNotEmpty()
    @IsNumber()
    cvc: number;
    @IsNotEmpty()
    holderName: number;
    @IsNotEmpty()
    address1: number;
    @IsNotEmpty()
    address2: number;

    
}
