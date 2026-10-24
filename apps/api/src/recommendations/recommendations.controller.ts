import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getRecommendations(@Req() req: any) {
    return this.recommendationsService.getRecommendations(req.user.userId);
  }
}
