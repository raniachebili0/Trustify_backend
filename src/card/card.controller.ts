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
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { BankingService } from 'src/services/BankingService';
import { Card } from './credit-card.schema';
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
    // Log received card number from request body
    console.log('Received card number:', body.number);

    // Fetch card data from the banking API
    const cardDataArray = await this.bankingService.getCardData(body.number);
    
    // Log the fetched card data
    console.log('Card data fetched from banking API:', cardDataArray);

    if (!cardDataArray || cardDataArray.length === 0) {
      throw new NotFoundException('Card not found in the banking API');
    }

    // Extract the first card data from the array
    const cardData = cardDataArray[0];

    // Ensure all fields are correctly set
    cardData.userId = userId; // Associate user with card data
    cardData.number = cardData.number || 'Unknown'; // Fallback
    cardData.expiry = cardData.expiry || 'N/A'; // Fallback
    cardData.cvc = cardData.cvc || '000'; // Fallback
    cardData.balance = cardData.balance || 0; // Fallback for balance
    cardData.transactions = cardData.transactions || []; // Fallback for transactions

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
  

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(id);
  }
}