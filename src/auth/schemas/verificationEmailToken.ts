// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import mongoose, { Document } from 'mongoose';

// @Schema()
// export class VerificationEmailToken extends Document {
//   @Prop({ required: true, unique: true })
//   token: string;

//   @Prop({ type: mongoose.Types.ObjectId, required: true, ref: 'User' })
//   userId: mongoose.Types.ObjectId;

//   @Prop({ required: true})
//   expiresAt: Date;
//   @Prop({ unique: true })
//   verificationToken: string;
// }

// export const VerificationTokenSchema = SchemaFactory.createForClass(
//   VerificationEmailToken,
// );
