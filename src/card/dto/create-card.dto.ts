import { IsNotEmpty, IsNumber } from "class-validator";
import { User } from "src/user/entities/user.entity";
import { Transactions } from "../credit-card.schema";

export class CreateCardDto {

    number: number;
    
    expiry: string;
    
    cvc: number;
  
    type: string;
    
    balance: number;

    transactions: Transactions[];

    
}
