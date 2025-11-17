/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Post } from '@nestjs/common';

import { OptReadPostDto } from 'src/dto/open-print-tag.dto';

import { OptService } from './opt.service';

@Controller('opt')
export class OptController {
  constructor(private readonly optService: OptService) {}

  @Get('initialize')
  async initialiteTag() {
    const data = await this.optService.initializeTag();
    // do something ?
    return data;
  }

  @Post('read-tag')
  async readTag(@Body() body: OptReadPostDto) {
    const data = await this.optService.readTag(body.payloadBase64);
    return data;
  }

  @Post('tag/write')
  async writeTag(@Body() body: OptReadPostDto) {
    const data = await this.optService.writeTag(body.payloadBase64);
    return data;
  }
}
