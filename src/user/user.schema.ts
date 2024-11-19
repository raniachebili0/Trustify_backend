import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  Companyname: string;
  @Prop()
  password: string;
  @Prop({ default: false })
  isVerified: boolean;
  @Prop({ unique: true })
  matricule: string;
  @Prop()
  expiresAt: Date;
  @Prop()
  verificationToken: string;
  @Prop({ required: false, type: SchemaTypes.ObjectId })
  roleId: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
