import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';

import { PrusamentGoodsObjectDto } from 'src/dto/prusament.dto';

import { PrusamentScraperService } from './prusament-scraper.service';

@Controller('prusament')
export class PrusamentController {
  constructor(private readonly playwrightService: PrusamentScraperService) {}

  @Get('spool-data')
  async getSpoolData(
    @Query('spoolId') spoolId: string,
  ): Promise<PrusamentGoodsObjectDto> {
    try {
      const data = await this.playwrightService.fetchPageAndGetData(spoolId);
      if (!data) {
        throw new Error('Not found');
      }

      // TODO validation
      return data;
    } catch (error: unknown) {
      throw new HttpException(
        {
          error: 'Failed to extract value',
          details: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.BAD_REQUEST,
        {
          description: 'some desc...',
        },
      );
    }
  }
}
