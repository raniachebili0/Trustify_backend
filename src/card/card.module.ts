import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Card, CardSchema } from './credit-card.schema';
<<<<<<< HEAD

import { BankingService } from 'src/services/BankingService';

=======
import { BankingService } from 'src/services/BankingService';



>>>>>>> origin/sabrina
@Module({
  imports:[
    MongooseModule.forFeature([{
    name: Card.name,
    schema: CardSchema
  }]),
  HttpModule],
  controllers: [CardController],
  providers: [CardService,BankingService],
})
export class CardModule {}
