/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { HttpStatusCode } from 'axios';
import { plainToClass } from 'class-transformer';
import { firstValueFrom } from 'rxjs';
import {
  DefaultApi,
  ExternalApi,
  FilamentApi,
  FilamentParametersDto,
  MessageDto,
  SpoolApi,
  SpoolApiAddSpoolSpoolPostRequest,
  SpoolApiFindSpoolSpoolGetRequest,
  SpoolDto,
  VendorApi,
  VendorDto,
} from 'src/api/spoolman';
import { APP_NAME, isEnvValueTruthy } from 'src/const/app.const';
import { PRUSAMENT_MANUFACTOR } from 'src/const/prusa.const';
import { SpoolmanFindPrusamentResultDto } from 'src/dto/spoolment.dto';
import { InvoiceItem, PrusamentService } from 'src/prusament/prusament.service';

@Injectable()
export class SpoolmanService {
  constructor(
    private readonly spoolApi: SpoolApi,
    private readonly filamentApi: FilamentApi,
    private readonly externalApi: ExternalApi,
    private readonly prusament: PrusamentService,
    private readonly vendorApi: VendorApi,
    private readonly spoolmanApi: DefaultApi,
    private readonly config: ConfigService,
  ) {}

  public get configExtraSpoolId() {
    return this.config.get<string>('SPPOLMAN_EXTRA_SPOOL_KEY_PRUSAMENT_ID');
  }

  public get configUseLotNr() {
    return isEnvValueTruthy(
      this.config.get('SPOOLMAN_USE_LOT_NR_FOR_PRUSAMENT_ID'),
    );
  }

  async findPrusamentFilament(
    spoolId: string,
  ): Promise<SpoolmanFindPrusamentResultDto> {
    const data = await this.prusament.getPrusamentSpoolData(spoolId);
    if (!data) {
      throw new Error('nope!');
    }

    const lowerCaseMaterial = data.filament.material.toLowerCase();
    const lowerCaseColorName = data.filament.color_name.toLowerCase();

    const resExternalFilament = await firstValueFrom(
      this.externalApi.getAllExternalFilamentsExternalFilamentGet(),
    );

    const external = resExternalFilament.data.filter(
      (f) =>
        f.manufacturer === PRUSAMENT_MANUFACTOR &&
        f.material.toLowerCase() === lowerCaseMaterial &&
        f.name.toLowerCase() === lowerCaseColorName &&
        this.similarSpoolWeight(f.weight, data.weight),
    );

    const resFilament = await firstValueFrom(
      this.filamentApi.findFilamentsFilamentGet({
        'vendor.name': PRUSAMENT_MANUFACTOR,
        material: lowerCaseMaterial,
        name: lowerCaseColorName,
      }),
    );

    return plainToClass(SpoolmanFindPrusamentResultDto, {
      internal: resFilament.data,
      external,
      prusament: data,
    });
  }

  private similarSpoolWeight(a: number, b: number) {
    return Math.abs(a - b) < 150;
  }

  async importPrusamentSpoolBulk(
    spoolIds: string[],
    location?: string,
    invoiceText?: string,
  ) {
    const invoiceItems: InvoiceItem[] = invoiceText
      ? this.prusament.parseInvoiceText(invoiceText)
      : [];

    // FIXME implement

    return [];
  }

  async importPrusamentSpool(
    spoolId: string,
    price?: number,
    location?: string,
  ): Promise<SpoolDto> {
    // TODO check if prusamentSpoolId parameter is set | or use lot_nr?
    // TODO check if the spool is already registered, if so abort

    const already = await this.getPrusamentSpool(spoolId);
    if (already.length > 0) {
      throw new HttpException(
        'Prusament spool already imported!',
        HttpStatusCode.BadRequest,
      );
    }

    const found = await this.findPrusamentFilament(spoolId);
    if (!found) {
      throw new Error('nope!');
    }

    console.log('Found:', found);

    if (found.internal.length > 1) {
      // uh uh not good, need to decide somehow!
      throw new Error('too many options');
    }

    let filament_id = 0;
    if (found.internal.length > 0) {
      filament_id = found.internal[0].id;
    } else {
      if (found.external.length === 0) {
        throw new Error('No external found');
      } else if (found.external.length > 1) {
        throw new Error('Too many externals');
      }

      let vendor: VendorDto;
      const resPrusamentVendor = await firstValueFrom(
        this.vendorApi.findVendorVendorGet({
          name: PRUSAMENT_MANUFACTOR,
          limit: 1,
        }),
      );
      if (resPrusamentVendor.data.length === 0) {
        // we must create it first
        vendor = (
          await firstValueFrom(
            this.vendorApi.addVendorVendorPost({
              VendorParametersDto: {
                name: PRUSAMENT_MANUFACTOR,
                comment: `Automatically created by ${APP_NAME}`,
              },
            }),
          )
        ).data;
      } else {
        vendor = resPrusamentVendor.data[0];
      }

      const data = found.external[0];

      const FilamentParametersDto: Required<FilamentParametersDto> = {
        article_number: null,
        color_hex: data.color_hex ?? null, // I noticed sometime the external color is different from prusament, should we update?
        comment: `Used external source and created by ${APP_NAME}`,
        diameter: data.diameter,
        external_id: data.id,
        density: data.density,
        material: data.material,
        multi_color_direction: data.multi_color_direction ?? null,
        multi_color_hexes: data.multi_color_direction ?? null,
        name: data.name,
        price: null, // TODO import from prusament?
        settings_bed_temp: data.bed_temp ?? null,
        settings_extruder_temp: data.extruder_temp ?? null,
        spool_weight: data.spool_weight ?? null,
        vendor_id: vendor.id,
        weight: data.weight,
        extra: null,
      };

      // TODO add/get manufactor
      const resAddFilementPost = await firstValueFrom(
        this.filamentApi.addFilamentFilamentPost({
          FilamentParametersDto,
        }),
      );

      filament_id = resAddFilementPost.data.id;
    }

    let lot_nr: string | null = null;
    const extra = {};
    if (this.configExtraSpoolId) {
      extra[this.configExtraSpoolId] = JSON.stringify(spoolId);
    }

    if (this.configUseLotNr) {
      lot_nr = spoolId;
    }

    const SpoolParametersDto: SpoolApiAddSpoolSpoolPostRequest['SpoolParametersDto'] =
      {
        filament_id,
        comment: `Imported via ${APP_NAME}`,
        extra,
        price,
        lot_nr,
        initial_weight: found.prusament.weight,
        spool_weight: found.prusament.spool_weight,
        location,
      };

    const resSpool = await firstValueFrom(
      this.spoolApi.addSpoolSpoolPost({ SpoolParametersDto }),
    );

    // TODO validate, etc
    return resSpool.data;
  }

  async getPrusamentSpool(spoolId: string) {
    const find: SpoolApiFindSpoolSpoolGetRequest = {
      lot_nr: this.configUseLotNr ? spoolId : undefined,
    };

    // TODO find by extra field - for this we need to get all spools and then check the extra fields as there is no way to filter by it
    // this should be cached - we can go probably cache hard because this shouldn't change
    // future future hook up the webhooks and listen to changes

    const res = await firstValueFrom(this.spoolApi.findSpoolSpoolGet(find));

    return res.data;
  }

  async deletePrusament(spoolId: string): Promise<MessageDto> {
    const has = await this.getPrusamentSpool(spoolId);
    if (has.length === 0) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    if (has.length > 1) {
      throw new HttpException(
        'More than one prusament found, safely abort!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const res = await firstValueFrom(
      this.spoolApi.deleteSpoolSpoolSpoolIdDelete({ spool_id: has[0].id }),
    );

    return res.data;
  }

  async checkHealth(): Promise<string> {
    return (await firstValueFrom(this.spoolmanApi.healthHealthGet())).data
      .status;
  }

  async spoolmanInfo() {
    return (await firstValueFrom(this.spoolmanApi.infoInfoGet())).data;
  }
}
