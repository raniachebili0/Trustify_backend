import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    readonly Companyname: string;
  
    @IsEmail()
    readonly email: string;
  
    @IsString()
    @MinLength(6)
    readonly password: string;
    @IsString()
    readonly  registrationNumb: string;
}
