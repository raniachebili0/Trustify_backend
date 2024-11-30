import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type CardDocument = HydratedDocument<Card>

@Schema()
export class  Transactions {
    @Prop()
    fromAccount: string| null;
    @Prop()
    toAccount: string| null;
    @Prop()
    amount: string;
    @Prop()
    newBalance: string;
    @Prop()
    txnType: string;
    @Prop()
    txnRef: string;

    @Prop()
    createdAt: string;

   // @Prop({ type: Date, default: Date.now })
   // createdAt: Date;
}
@Schema()
export class Card {
    @Prop()
    number: string;
    @Prop()
    expiry: string;
    @Prop()
    cvc: string;
    @Prop()
    balance: string;
    @Prop()
    type: string;


    @Prop({ type: [Transactions], default: [] }) // Embed the transactions array
    transactions: Transactions[];

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    // @Prop({required: true})
     userId: string ;
}


export const CardSchema = SchemaFactory.createForClass(Card);
