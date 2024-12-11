import { SetMetadata } from '@nestjs/common';
import { Permission } from 'src/roles/dtos/role.dto';

// Define a constant for the key used in metadata storage
export const PERMISSIONS_KEY = "permissions";

// The Permissions decorator function that sets metadata on the route handler
export const Permissions = (... permissions: Permission[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);
