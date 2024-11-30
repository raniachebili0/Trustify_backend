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
  

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(id);
  }
}
