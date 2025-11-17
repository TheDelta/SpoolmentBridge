/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';

import { PrusamentScraperService } from './prusament-scraper.service';

export interface InvoiceItem {
  filament: string;
  quantity: number;
  priceVat: string;
}

@Injectable()
export class PrusamentService {
  constructor(private readonly prusamentScraper: PrusamentScraperService) {}

  public getPrusamentSpoolData(spoolId: string) {
    return this.prusamentScraper.fetchPageAndGetData(spoolId);
  }

  public parseInvoiceText(text: string): InvoiceItem[] {
    const lines = text.trim().split('\n');
    const entries: InvoiceItem[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      // Match lines starting with item number, with dynamic VAT % and any currency symbol
      // Example: 1 Prusament PETG Clear 1kg Refill 1 15.87 EUR 15.87 EUR 19 %
      const match = line.match(
        /^(\d+)\s+(.+?)\s+(\d+)\s+\d+\.\d+\s+([^\d\s]+)\s+\d+\.\d+\s+\4\s+(\d+)\s*%$/,
      );

      if (match) {
        const [, , description, qtyStr, currency, vatPercent] = match;
        let filament = description;
        const quantity = parseInt(qtyStr, 10);

        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          // Extract the full price with VAT: number + currency at end of line
          const priceMatch = nextLine.match(
            new RegExp(`(\\d+\\.\\d{2})\\s+${currency}$`),
          );
          if (priceMatch) {
            const priceVat = priceMatch[1];
            entries.push({
              filament,
              quantity,
              priceVat: `${priceVat} ${currency}`,
            });
          }
        }
        i += 2;
      } else {
        if (entries.length > 0 && !line.match(/^\d+\s/)) {
          entries[entries.length - 1].filament += ' ' + line;
        }
        i++;
      }
    }

    return entries;
  }
}
