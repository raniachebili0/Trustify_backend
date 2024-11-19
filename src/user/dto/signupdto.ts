import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  Companyname: string;
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, {
    message: 'Password must contain at least one number',
  })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
  @Matches(/^\d{2}\d{2}\d{7}\d{2}$/, {
    message:
      "Le matricule fiscal doit être composé de 13 chiffres au format valide : XX XX XXXXXXXXXXX, où les deux premiers chiffres représentent l'année, les deux suivants le code régional, et les sept derniers le numéro unique de l'entreprise.",
  })
  @IsNotEmpty({ message: 'Matricule is required' })
  matricule: string;
}
