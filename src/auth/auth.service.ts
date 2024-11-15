import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { MailService } from './services/mail.service';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignupDto } from './dto/signupdto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/logindto';
import { RolesService } from 'src/roles/roles.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private readonly mailService: MailService, // Inject MailService
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
     private jwtService: JwtService,
    private rolesService: RolesService,
  ) {}
  async signup(signupData: SignupDto) {
    const { email ,address ,password , matricule , Companyname } = signupData;

    // Check if email is already in use
    const emailInUse = await this.UserModel.findOne({ email });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // const verificationToken = uuidv4()
    // const expiresAt = new Date();
    // expiresAt.setHours(expiresAt.getHours() + 1);
    // await this.verificationTokenEmailModel.create({
    //   token: verificationToken,
    //   userId: user._id,
    //   expiresAt,
    // });
    // Send verification email
    // const verificationLink = `http://yourapp.com/verify-email?token=${verificationToken}`;
    // await this.mailService.sendEmailVerification(
    //   email,
    //   `Click the link to verify your email: ${verificationLink}`,
    // );
    // Générer un token de vérification unique et définir l’expiration
    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Créer un nouvel utilisateur avec le token et l’état non vérifié
    const user = await this.UserModel.create({
      email,
      Companyname,
      address,
      matricule,
      password : hashedPassword,
      isVerified: false,
      verificationToken,
      expiresAt,
    });
    await this.mailService.sendEmailVerification(email, verificationToken);
    return { message: 'Verification email sent.' };
  }

  async verifyEmail(emailToken: string) {
    // Lookup the user based on a unique identifier associated with the token
    const user = await this.UserModel.findOne({
      verificationToken: emailToken,
      expiresAt: { $gt: new Date()}
    });
    if (!user || user.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }
    // Mark the user as verified
    user.isVerified = true;
    user.verificationToken = undefined; // Supprimer le token après vérification
    user.expiresAt =  undefined;
    await user.save();

    return { message: 'Email successfully verified' };
  }
  // async completeProfile(userId, profileData: CompleteProfiledto) {
  //   const { name, matricule, password, address } = profileData;

  //   const user = await this.UserModel.findById(userId);
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   if (!user.isVerified) {
  //     throw new UnauthorizedException('Email verification required.');
  //   }
  //   // Hash the password
  //   const hashedPassword = await bcrypt.hash(password, 10);
  //   user.name = name;
  //    user.matricule = matricule;
  //    user.address = address;
  //   user.password = hashedPassword;
  //   await user.save();

  //   return { message: 'Profile completed successfully' };
  // }
  async login(credentials: LoginDto) {
    const { email, password } = credentials;

    // Rechercher l'utilisateur par email
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Vérifier si l'utilisateur a vérifié son email
    if (!user.isVerified) {
      throw new UnauthorizedException('Email has not been verified');
    }

    // Vérifier si le mot de passe est correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Si tout est correct, retourner un message de succès (ou un token JWT si nécessaire)
    return { message: 'Login successful' };
  }
  async refreshTokens(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh Token is invalid');
    }
    return this.generateUserTokens(token.userId);
  }
  async generateUserTokens(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '10h' });
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }
  async storeRefreshToken(token: string, userId: string) {
    // Calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      {
        upsert: true,
      },
    );
  }

  async getUserPermissions(userId: string) {
     const user = await this.UserModel.findById(userId);

     if (!user) throw new BadRequestException();

     const role = await this.rolesService.getRoleById(user.roleId.toString());
    return role.permissions;
  }
}
