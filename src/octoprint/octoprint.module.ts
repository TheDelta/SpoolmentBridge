/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

import { OctoprintController } from './octoprint.controller';
import { OctoprintService } from './octoprint.service';

@Module({
  imports: [],
  controllers: [OctoprintController],
  providers: [OctoprintService],
})
export class OctoprintModule {}
