import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class OptReadPostDto {
  @ApiProperty()
  @IsString()
  payloadBase64: string;
}
