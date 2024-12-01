import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticationGuard } from './guards/authentication.guard';
import { AuthorizationGuard } from './guards/authorization.guard';
import { Resource } from './roles/enums/resource.enum';
import { Action } from './roles/enums/action.enum';
import { Permissions } from './decorators/permissions.decorator';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('documents')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Permissions([{ resource: Resource.DOCUMENTS, actions: [Action.READ] }])
  @Get()
  someProtectedRoute(@Req() req) {
    return { message: 'Accessed Resource', userId: req.userId };
  }
}
