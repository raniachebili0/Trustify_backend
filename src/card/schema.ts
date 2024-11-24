import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CardDocument = HydratedDocument<Card>

@Schema()
export class Card {
    @Prop({ required: true })
    cardNumber: number;
    @Prop()
    expirationDate: number;
    @Prop()
    cvc: number;
    @Prop()
    holderName: number;
    @Prop()
    address1: number;
    @Prop()
    address2: number;
}


export const CardSchema = SchemaFactory.createForClass(Card);
