import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getVersion(): string {
    return 'TODO | v1337'; // TODO load package json
  }
}
