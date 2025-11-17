import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { IsCurrency, IsString, MinLength } from 'class-validator';

export class PostImportPrusamentDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  spoolId: string;

  @ApiProperty()
  @Optional()
  @IsCurrency({
    allow_negatives: false,
    allow_space_after_digits: true,
    allow_space_after_symbol: true,
  })
  price?: string;

  @ApiProperty()
  @Optional()
  @IsString()
  location?: string;
}

export class PostImportPrusamentBulkDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  spoolIds: string[];

  @ApiProperty()
  @Optional()
  @IsString()
  invoiceText?: string;

  @ApiProperty()
  @Optional()
  @IsString()
  location?: string;
}
