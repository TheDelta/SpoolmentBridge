import { DynamicModule, Module, Global, Provider } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AsyncConfiguration, Configuration, ConfigurationFactory } from './configuration';

import { DefaultApi } from './api/default.api';
import { ExportApi } from './api/export.api';
import { ExternalApi } from './api/external.api';
import { FieldApi } from './api/field.api';
import { FilamentApi } from './api/filament.api';
import { OtherApi } from './api/other.api';
import { SettingApi } from './api/setting.api';
import { SpoolApi } from './api/spool.api';
import { VendorApi } from './api/vendor.api';

@Global()
@Module({
  imports:      [ HttpModule ],
  exports:      [
    DefaultApi,
    ExportApi,
    ExternalApi,
    FieldApi,
    FilamentApi,
    OtherApi,
    SettingApi,
    SpoolApi,
    VendorApi
  ],
  providers: [
    DefaultApi,
    ExportApi,
    ExternalApi,
    FieldApi,
    FilamentApi,
    OtherApi,
    SettingApi,
    SpoolApi,
    VendorApi
  ]
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): DynamicModule {
        return {
            module: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    /**
     * Register the module asynchronously.
     */
    static forRootAsync(options: AsyncConfiguration): DynamicModule {
        const providers = [...this.createAsyncProviders(options)];
        return {
            module: ApiModule,
            imports: options.imports || [],
            providers,
            exports: providers,
        };
    }

    private static createAsyncProviders(options: AsyncConfiguration): Provider[] {
        if (options.useClass) {
            return [
                this.createAsyncConfigurationProvider(options),
                {
                    provide: options.useClass,
                    useClass: options.useClass,
                },
            ];
        }
        return [this.createAsyncConfigurationProvider(options)];
    }

    private static createAsyncConfigurationProvider(
        options: AsyncConfiguration,
    ): Provider {
        if (options.useFactory) {
            return {
                provide: Configuration,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        return {
            provide: Configuration,
            useFactory: async (optionsFactory: ConfigurationFactory) =>
                await optionsFactory.createConfiguration(),
            inject: (options.useExisting && [options.useExisting]) || (options.useClass && [options.useClass]) || [],
        };
    }

    constructor( httpService: HttpService) { }
}
