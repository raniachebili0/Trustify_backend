import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsOptional() 
  name:string;
  @ApiProperty({ description: 'The email of company' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The name of company' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @IsOptional()  
  Companyname: string;

  @ApiProperty({ description: 'The password of account' })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, {
    message: 'Password must contain at least one number',
  })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({ description: 'registration number of company' })
  @Matches(/^\d{2}\d{2}\d{7}\d{2}$/, {
    message:
      "Le matricule fiscal doit être composé de 13 chiffres au format valide : XX XX XXXXXXXXXXX, où les deux premiers chiffres représentent l'année, les deux suivants le code régional, et les sept derniers le numéro unique de l'entreprise.",
  })
  @IsNotEmpty({ message: 'registration number is required' })
  @IsOptional()
  registrationNumb: string;
}



export class SignupResponseDto {
  @ApiProperty({ description: 'The email of company' })
  email: string;

  @ApiProperty({ description: 'The name of company' })
  Companyname: string;
  @ApiProperty({ description: 'The password of account' })
  password: string;
  @ApiProperty({
    description: 'registration number of company',
    example: '1012987654321',
  })
  registrationNumb: string;

  @ApiProperty({ description: 'The role ID assigned to the user' })
  roleId: string;

}
