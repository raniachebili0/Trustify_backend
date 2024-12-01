<<<<<<< HEAD
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
=======
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  Req,
  UseInterceptors,
} from '@nestjs/common';
>>>>>>> origin/sabrina
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { BankingService } from 'src/services/BankingService';
import { Card } from './credit-card.schema';
<<<<<<< HEAD

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
=======
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { LoggingInterceptor } from 'Interceptor/LoggingInterceptor';

@Controller('card')
@UseGuards(AuthenticationGuard)
@UseInterceptors(LoggingInterceptor)
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly bankingService: BankingService,
  ) {}

  @Post('add')
  async addCreditCard(
    @Body() body: { number: string },
    @Req() req, // Contains user from AuthenticationGuard
  ) {
    const userId = req.userId; // Extract authenticated user
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      // Fetch card data from the banking API
      const cardData = await this.bankingService.getCardData(body.number);

      if (!cardData || Object.keys(cardData).length === 0) {
        throw new NotFoundException('Card not found in the banking API');
      }

      // Associate card with logged-in user
      cardData.userId = userId; // fiha fazaz

      // Save the card data to MongoDB
      const savedCard = await this.cardService.saveCardData(cardData);
      return savedCard;
    } catch (error) {
      console.error('Error adding credit card:', error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('getCardByUserId')
  async findCard(@Req() req): Promise<Card | null> {
    const userIdFromToken = req.userId;  // Extract userId from the JWT token

    // Fetch cards for the authenticated user directly
    return await this.cardService.findOneCard(userIdFromToken);
  }
  
>>>>>>> origin/sabrina

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(id);
  }
<<<<<<< HEAD

  
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
=======
>>>>>>> origin/sabrina
}
