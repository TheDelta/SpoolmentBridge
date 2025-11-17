import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OctoprintModule } from './octoprint/octoprint.module';
import { OptModule } from './opt/opt.module';
import { PrusamentModule } from './prusament/prusament.module';
import { SpoolmanModule } from './spoolman/spoolman.module';

@Module({
  imports: [
    OptModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
    SpoolmanModule,
    OctoprintModule,
    PrusamentModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'assets/frontend'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
