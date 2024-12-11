import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { User } from './user.schema';
import { LoggingInterceptor } from 'Interceptor/LoggingInterceptor';
import {
  Permissions,
  PERMISSIONS_KEY,
} from 'src/decorators/permissions.decorator';
import { permission } from 'process';
import { Permission } from 'src/roles/dtos/role.dto';
import { Resource } from 'src/roles/enums/resource.enum';
import { Action } from 'src/roles/enums/action.enum';
import { AuthorizationGuard } from 'src/guards/authorization.guard';

@ApiTags('User Section')
@Controller('users')
@UseInterceptors(LoggingInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user')
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.create(createUserDto);
  }
  @Permissions({ resource: Resource.USERS, actions: [Action.READ] }) 
  @UseGuards(AuthorizationGuard) 
  @UseGuards(AuthenticationGuard)
  @Get('list')
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }
  
  @UseGuards(AuthenticationGuard)
  @Get('profile')
  async findOne(@Req() req): Promise<User> {
    return await this.userService.findOne(req.userId); // Fetch logged-in user's data
  }
  @UseGuards(AuthenticationGuard)
  @Patch('profile')
  async update(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.update(req.userId, updateUserDto); // Update logged-in user
  }
  @Permissions({ resource: Resource.USERS, actions: [Action.DELETE] })
  @UseGuards(AuthorizationGuard)
  @UseGuards(AuthenticationGuard)
  @Delete(':userId')
async remove(@Param('userId') userId: string): Promise<{ message: string }> {
  try {
    // Call the service to delete the user by their userId
    await this.userService.remove(userId);
    return { message: 'User successfully deleted' };
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;  // Propagate the NotFoundException from the service
    }
    throw new ForbiddenException('You do not have permission to delete this user');
  }
}
@UseGuards(AuthenticationGuard)
@Get('signout')
async signOut(@Req() req): Promise<any> {
  
  await this.userService.signOut(req.userId);
  return { message: 'User signed out successfully' };
}
  // @Delete('profile')
  // async remove(@Req() req): Promise<{ message: string }> {
  //   await this.userService.remove(req.userId);
  //   return { message: 'User successfully deleted' }; // Delete logged-in user
  // }
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(id);
  // }
}
