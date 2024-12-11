import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './schemas/role.schema';
import { Model } from 'mongoose';
import { CreateRoleDto } from './dtos/role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private RoleModel: Model<Role>) {}

  async createRole(role: CreateRoleDto) {
    
    return this.RoleModel.create(role);
  }
  async getRoleByName(roleName: string): Promise<Role> {
    return await this.RoleModel.findOne({ name: roleName });
  }
  async getRoleById(roleId: string): Promise<Role> {
    return this.RoleModel.findById(roleId).exec();
  }

}
