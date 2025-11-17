import { Module } from '@nestjs/common';

import { PrusamentScraperService } from './prusament-scraper.service';
import { PrusamentController } from './prusament.controller';
import { PrusamentService } from './prusament.service';

@Module({
  imports: [],
  controllers: [PrusamentController],
  providers: [PrusamentService, PrusamentScraperService],
  exports: [PrusamentService],
})
export class PrusamentModule {}
