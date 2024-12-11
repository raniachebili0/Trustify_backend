import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { AuthModule } from 'src/auth/auth.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
    RolesModule,
  ],

  controllers: [UserController],
  providers: [UserService, AuthorizationGuard],
  exports: [UserService, MongooseModule],
})
export class UserModule {}
