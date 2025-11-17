import { ApiProperty } from '@nestjs/swagger';

import {
  PrusamentFilament,
  PrusamentGoodsObject,
} from 'src/interfaces/prusament.interface';

export class PrusamentFilamentDto implements PrusamentFilament {
  @ApiProperty()
  color_name: string;

  @ApiProperty()
  color_rgb: string;

  @ApiProperty()
  material: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  photo_url: string;

  @ApiProperty()
  grade: number;

  @ApiProperty()
  he_min: number;

  @ApiProperty()
  he_max: number;

  @ApiProperty()
  hb_min: number;

  @ApiProperty()
  hb_max: number;
}

export class PrusamentGoodsObjectDto implements PrusamentGoodsObject {
  @ApiProperty()
  ff_goods_id: number;
  @ApiProperty()
  country: string;
  @ApiProperty()
  sample: boolean;
  @ApiProperty()
  diameter_avg: number;
  @ApiProperty()
  diameter_measurement: string;
  @ApiProperty()
  diameter_measurement_full: string;
  @ApiProperty()
  diameter_standard_deviation: number;
  @ApiProperty({ type: [PrusamentFilamentDto] })
  filament: PrusamentFilamentDto;
  @ApiProperty()
  length: number;
  @ApiProperty()
  manufacture_date: string;
  @ApiProperty()
  time_zone_difference: string;
  @ApiProperty()
  max_diameter_offset: string;
  @ApiProperty()
  ovality: number;
  @ApiProperty()
  weight: number;
  @ApiProperty()
  spool_weight: number;
}
