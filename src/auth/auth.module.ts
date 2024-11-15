/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { MailService } from './services/mail.service';
import { RolesModule } from 'src/roles/roles.module';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';


@Module({
  imports: [
    RolesModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, {
      name: RefreshToken.name,
      schema: RefreshTokenSchema,
    },]),
  ],
  providers: [AuthService,MailService],
  controllers: [AuthController],
})
export class AuthModule {}
