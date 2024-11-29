import { Body, Controller, Post } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dtos/role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('role')
  async createRole(@Body() role: CreateRoleDto) {
   // console.log('Role Data:', role); 
    return this.rolesService.createRole(role);
  }
}
