import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { BankingService } from 'src/services/BankingService';
import { Card } from './credit-card.schema';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService,
    private readonly  bankingService :BankingService
  ) {}


  @Post('add')
  async addCreditCard(@Body() body: { number: string }) {
    // Fetch card data from the mock API

    try {
      const cardData = await this.bankingService.getCardData(body.number);
      console.log('Card Data:', cardData);
      
      if (!cardData || Object.keys(cardData).length === 0) {
        throw new Error('Card not found in the banking API');
      }
  
      // Save the card with its transactions directly in MongoDB
      const savedCard = await this.cardService.saveCardData(cardData);
      console.log('Saved Card:', savedCard); 
      return savedCard;
    } catch (error) {




      console.error('Error adding credit card:', error.message);
      throw new Error(error.message);
    }
  }


  @Get('getCardByUserId')
  async findCard(@Query('userId') id: string): Promise<Card | null> {
    return await this.cardService.findOneCard(id);  
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(id);
  }

  
 /* 
  @Post()
  create(@Body() createCardDto: CreateCardDto) {
    return this.cardService.create(createCardDto);
  }

  @Get()
  findAll() {
    return this.cardService.findAll();
  }

  

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardService.update(+id, updateCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardService.remove(+id);
  }*/
}
