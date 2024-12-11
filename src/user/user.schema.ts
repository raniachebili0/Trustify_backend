import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Resource } from 'src/roles/enums/resource.enum';
import { Role } from 'src/roles/schemas/role.schema';
@Schema()
export class User extends Document {
  @Prop({required: false })
  name: string;
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ })
  Companyname: string;

  @Prop()
  password: string;
  @ApiProperty({ description: 'status of verification email' })
  @Prop({ default: false })
  isVerified: boolean;

  @Prop({})
  registrationNumb: string;

  @Prop()
  expiresAt: Date;
  @Prop()
  verificationToken: string;
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })  // Reference to the Role schema
  roleId: Types.ObjectId;
  
}

export const UserSchema = SchemaFactory.createForClass(User);
