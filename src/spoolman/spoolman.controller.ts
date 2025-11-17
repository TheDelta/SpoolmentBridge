/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { MessageDto, SpoolDto } from 'src/api/spoolman';
import {
  PostImportPrusamentBulkDto,
  PostImportPrusamentDto,
} from 'src/dto/import-prusament.dto';
import { SpoolmanFindPrusamentResultDto } from 'src/dto/spoolment.dto';

import { SpoolmanService } from './spoolman.service';

@Controller()
export class SpoolmanController {
  constructor(private readonly spoolman: SpoolmanService) {}

  @Post('import-prusament-spool')
  async importPrusamentSpool(
    @Body() dto: PostImportPrusamentDto,
  ): Promise<SpoolDto> {
    console.log('Import Spool:', dto);
    const price = dto.price
      ? parseFloat(dto.price.replace(/[^\d.]/g, ''))
      : undefined;
    return this.spoolman.importPrusamentSpool(dto.spoolId, price, dto.location);
  }

  @Post('import-prusament-spool-bulk')
  async importPrusamentSpoolBulk(
    @Body() dto: PostImportPrusamentBulkDto,
  ): Promise<SpoolDto[]> {
    return this.spoolman.importPrusamentSpoolBulk(
      dto.spoolIds,
      dto.location,
      dto.invoiceText,
    );
  }

  @Get('find-prusament-filament')
  @ApiResponse({
    type: SpoolmanFindPrusamentResultDto,
  })
  async findPrusamentFilament(
    @Query('spoolId') spoolId: string,
  ): Promise<SpoolmanFindPrusamentResultDto> {
    return this.spoolman.findPrusamentFilament(spoolId);
  }

  @Get('has-prusament-spool')
  @ApiResponse({
    type: SpoolmanFindPrusamentResultDto,
  })
  async hasPrusamentSpool(
    @Query('spoolId') spoolId: string,
  ): Promise<SpoolDto[]> {
    return this.spoolman.getPrusamentSpool(spoolId);
  }

  @Delete('prusament-spool')
  @ApiResponse({
    type: 'MessageDto',
  })
  async deletePrusamentSpool(
    @Query('spoolId') spoolId: string,
  ): Promise<MessageDto> {
    return this.spoolman.deletePrusament(spoolId);
  }
}
