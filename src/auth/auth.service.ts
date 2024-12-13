import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Req,
  InternalServerErrorException,
} from '@nestjs/common';
import { MailService } from './services/mail.service';
import { User } from '../user/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignupDto } from '../user/dto/signupdto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from '../user/dto/logindto';
import { RolesService } from 'src/roles/roles.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';
import { nanoid } from 'nanoid';
import { ResetToken } from './schemas/reset-token.schema';
import { userInfo } from 'os';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private readonly mailService: MailService, // Inject MailService
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
    private rolesService: RolesService,
    @InjectModel(ResetToken.name)
    private ResetTokenModel: Model<ResetToken>,
  ) {}
  async signupUser(signupData: SignupDto) {
    const { email, password, registrationNumb, Companyname } = signupData;

    // Check if email is already in use
    const emailInUse = await this.UserModel.findOne({ email });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token and expiration time
    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiration

    // Get the 'user' role reference
    const role = await this.rolesService.getRoleByName('user');
    if (!role) {
      throw new BadRequestException('User role not found');
    }

    // Create a new user with the roleId assigned
    const user = await this.UserModel.create({
      email,
      Companyname,
      registrationNumb,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      expiresAt,
      roleId: role._id, // Assign the role's ObjectId
    });

    // Send email verification
    await this.mailService.sendEmailVerification(email, verificationToken);

    return { message: 'Check your email to verify your account' };
  }
  async signupAdmin(signupData: SignupDto) {
    const { email, password, name } = signupData;

    // Check if email is already in use
    const emailInUse = await this.UserModel.findOne({ email });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminRole = await this.rolesService.getRoleByName('admin');
    // Create a new admin
    const admin = await this.UserModel.create({
      name,
      email,
      password: hashedPassword,
      roleId: adminRole._id, // Assign the admin role
      isVerified: true, // Admins are verified by default
    });

    return { message: 'Admin account created successfully' };
  }
  async verifyEmail(emailToken: string) {
    // Lookup the user based on a unique identifier associated with the token
    const user = await this.UserModel.findOne({
      verificationToken: emailToken,
      expiresAt: { $gt: new Date() },
    });
    if (!user || user.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }
    // Mark the user as verified
    user.isVerified = true;
    user.verificationToken = undefined; // Supprimer le token après vérification
    user.expiresAt = undefined;
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
    //Generate JWT tokens
    const tokens = await this.generateUserTokens(user._id);
    return {
      ...tokens,
      userId: user._id,
    };
  }
  async changePassword(userId, oldPassword: string, newPassword: string) {
    //Find the user
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found...');
    }

    //Compare the old password with the password in DB
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Change user's password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();
  }

  async forgotPassword(email: string) {
    //Check that user exists
    const user = await this.UserModel.findOne({ email });

    if (user) {
      //If user exists, generate password reset link
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const resetToken = nanoid(64);
      await this.ResetTokenModel.create({
        token: resetToken,
        userId: user._id,
        expiryDate,
      });
      //Send the link to the user by email
      this.mailService.sendPasswordResetEmail(email, resetToken);
    }

    return { message: 'If this user exists, they will receive an email' };
  }
  async validateResetToken(token: string): Promise<boolean> {
    // Find the reset token in the database
    const resetToken = await this.ResetTokenModel.findOne({ token });

    if (!resetToken) {
      return false; // Token is invalid if not found
    }

    // Check if the token has expired
    const isTokenExpired = new Date() > resetToken.expiryDate;
    if (isTokenExpired) {
      return false; // Token is invalid if it has expired
    }

    return true; // Token is valid
  }
  async resetPassword(newPassword: string, resetToken: string) {
    //Find a valid reset token document
    const token = await this.ResetTokenModel.findOneAndDelete({
      token: resetToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid link');
    }

    //Change user password (MAKE SURE TO HASH!!)
    const user = await this.UserModel.findById(token.userId);
    if (!user) {
      throw new InternalServerErrorException();
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }

  //gère la régénération des tokens sans que l'utilisateur ait besoin de se reconnecter.
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
  //Génère les tokens pour l'accès et le rafraîchissement lors de la connexion ou du renouvellement
  async generateUserTokens(userId) {
    const accessToken = this.jwtService.sign(
      { userId },
      { expiresIn: "30d" },
    );
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
    // Update the refresh token in the database, or create it if it doesn’t exist
    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      {
        upsert: true, // creates a new document if none exists
      },
    );
  }

  async getUserPermissions(userId: string) {
    const user = await this.UserModel.findById(userId);

    if (!user) throw new BadRequestException();
    // Fetch the user's role and associated permissions
    const role = await this.rolesService.getRoleById(user.roleId.toString());
    return role.permissions;
  }

  
}