import { ApiProperty } from '@nestjs/swagger';

import { ExternalFilamentDto, FilamentDto } from 'src/api/spoolman';

import { PrusamentGoodsObjectDto } from './prusament.dto';

export class SpoolmanFindPrusamentResultDto {
  @ApiProperty()
  prusament: PrusamentGoodsObjectDto;
  @ApiProperty()
  internal: FilamentDto[];
  @ApiProperty()
  external: ExternalFilamentDto[];
}
