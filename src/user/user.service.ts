import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
  @InjectModel(User.name) private UserModel: Model<User>
){}
  create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.UserModel(createUserDto);
    return newUser.save();
  }

  findAll(): Promise<User[]> {
    return this.UserModel.find().exec(); 
  }

  async findOne(id: string): Promise<User>  {
    const user = await this.UserModel.findById(id).exec(); 
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id:string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.UserModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true } // Return the updated document
    ).exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async remove(id: string) {
    const deletedUser = await this.UserModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return deletedUser;
  
  }
}
