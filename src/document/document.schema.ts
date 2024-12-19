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
    @Prop()
    totalAmount : string;

    @Prop()
    Accontenumber : string;


    @Prop()
    fileId : string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
     userId: string ;

     @Prop()
     typeDoc : string;


     @Prop()

     dateDeCreation : Date;
     
     
}


export const UploadedFileModelSchema = SchemaFactory.createForClass(UploadedFileModel);
function Column(arg0: string): (target: UploadedFileModel, propertyKey: "dateDeCreation") => void {
    throw new Error("Function not implemented.");
}

