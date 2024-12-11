/* eslint-disable prettier/prettier */
import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MailService } from './services/mail.service';
import { RolesModule } from 'src/roles/roles.module';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { ResetToken, ResetTokenSchema } from './schemas/reset-token.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    RolesModule,
    forwardRef(() => UserModule),
    MongooseModule.forFeature([
      {
        name: RefreshToken.name,
        schema: RefreshTokenSchema,
      },
      {
        name: ResetToken.name,
        schema: ResetTokenSchema,
      },
    ]),
  ],
  providers: [AuthService, MailService],
  controllers: [AuthController],
  exports:[AuthService],
})
export class AuthModule {}
