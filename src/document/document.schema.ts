import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
export type UploadedFileModelDocument = HydratedDocument<UploadedFileModel>


@Schema()
export class UploadedFileModel {
    @Prop()
    fileName: string;
    @Prop()
    blobId: string;
    @Prop()
    url: string;
   
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
     userId: string ;
}


export const UploadedFileModelSchema = SchemaFactory.createForClass(UploadedFileModel);
