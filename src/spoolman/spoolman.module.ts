/*
https://docs.nestjs.com/modules
*/
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ApiModule, Configuration } from 'src/api/spoolman';
import { PrusamentModule } from 'src/prusament/prusament.module';

import { SpoolmanController } from './spoolman.controller';
import { SpoolmanService } from './spoolman.service';

@Module({
  imports: [
    PrusamentModule,
    ApiModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): Configuration => {
        const baseUrl = config.getOrThrow<string>('SPOOLMAN_BASE_URL');
        console.log('Using Spoolman base url:', baseUrl);
        return new Configuration({
          // set configuration parameters here.
          basePath: `${baseUrl}/api/v1`,
        });
      },
    }),
  ], // http://dolphnas:5010/api/v1
  controllers: [SpoolmanController],
  providers: [SpoolmanService],
})
export class SpoolmanModule {}
