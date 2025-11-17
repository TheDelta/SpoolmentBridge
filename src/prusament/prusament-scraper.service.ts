import { Injectable, OnModuleDestroy } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { Browser, BrowserContext, chromium, Page } from 'playwright';
import { APP_USER_AGENT } from 'src/const/app.const';
import { PrusamentGoodsObjectDto } from 'src/dto/prusament.dto';
import { PrusamentGoodsObject } from 'src/interfaces/prusament.interface';

@Injectable()
export class PrusamentScraperService implements OnModuleDestroy {
  public static readonly baseUrlSpool = 'https://prusament.com/spool/';
  private browser: Browser;
  private browserContext: BrowserContext;

  async fetchPageAndGetData(
    spoolId: string,
  ): Promise<PrusamentGoodsObjectDto | null> {
    await this.init();
    const page: Page = await this.browser.newPage();
    await page.goto(
      `${PrusamentScraperService.baseUrlSpool}?spoolId=${spoolId}`,
      { waitUntil: 'domcontentloaded' },
    );

    const title = await page.title(); // Spool detail page | Prusament

    await page.waitForFunction(
      () => (window as { spoolFound?: boolean }).spoolFound !== undefined,
      undefined,
      {
        timeout: 10e3,
      },
    );

    const foundResult = await page.evaluate<boolean>(`window.spoolFound`);
    if (foundResult !== true) {
      return null; // TODO "not found error!"
    }

    try {
      // Evaluate the JavaScript expression on the page context
      const resultData = await page.evaluate<string>(`window.spoolData`);
      await page.close();

      const obj = JSON.parse(resultData) as PrusamentGoodsObject;

      const dto = plainToInstance(PrusamentGoodsObjectDto, obj);

      return dto; // TODO validation / transform into object
    } catch (e) {
      return null;
    }
  }

  private async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }

    if (!this.browserContext) {
      const context = await this.browser.newContext();
      const page = await context.newPage();
      // Get the default user agent from the browser context
      const defaultUserAgent = await page.evaluate(() => navigator.userAgent);
      await context.close();

      // Create a new context with custom user agent
      this.browserContext = await this.browser.newContext({
        userAgent: `${defaultUserAgent} ${APP_USER_AGENT}`,
      });
    }
  }

  async onModuleDestroy() {
    if (this.browserContext) {
      await this.browserContext.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}
