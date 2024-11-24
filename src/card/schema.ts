import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type CardDocument = HydratedDocument<Card>

@Schema()
export class Card {
    @Prop({ required: true })
    cardNumber: number;
    @Prop()
    expirationDate: string;
    @Prop()
    cvc: number;
    @Prop()
    holderName: string;
    @Prop()
    address1: string;
    @Prop()
    address2: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    userId: string;
}


export const CardSchema = SchemaFactory.createForClass(Card);
