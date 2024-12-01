import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
<<<<<<< HEAD

@Module({
  controllers: [UserController],
  providers: [UserService],
=======
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';

@Module({
  imports: [ 
    MongooseModule.forFeature([
    { name: User.name, schema: UserSchema } 
  ])
    ],
  
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, MongooseModule],
>>>>>>> origin/sabrina
})
export class UserModule {}
