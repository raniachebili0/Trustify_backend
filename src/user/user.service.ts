import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.UserModel(createUserDto);
    return await newUser.save();
  }

  async findAll(): Promise<User[]> {
    return await this.UserModel.find().exec();
  }

  async findOne(userId: string): Promise<User> {
    const user = await this.UserModel.findById(userId)
      .select('-password -_id -isVerified') // Exclude password, _id, and isVerified fields
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.UserModel.findByIdAndUpdate(
      userId,
      updateUserDto,
      { new: true }, // Return the updated document
    ).select('-password -_id -isVerified') // Exclude password, _id, and isVerified fields
    .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return updatedUser;
  }

  async remove(userId: string) {
    const deletedUser = await this.UserModel.findByIdAndDelete(userId).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return ;
  }
}
