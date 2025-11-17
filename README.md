# SpoolmentBrdige

Bridge for Spoolman + Prusament  - Also add support for OpenPrintTag quick and chaotic.

⚠️ Please note this is W.I.P and may break or does something stupid - it has no test coverage and is in early development stage
⚠️ I could add all my spools from my last order without issues, but with software you never know what quirks and bugs are introduced :D

## What does this service do?

Each Prusament spool has a QR / spoolId with nice data about your spool.

Wouldn't it be nice to easily import this data into your Spoolman instance and even better write it on the new OpenPrintTag.org tags?

Well this service tries to achieve both things.

While we wait for Prusa to release their full solution, this is like a gap filling solution for those who can't wait to try and think how this system could improve our workflow.

## Installation

The easiest solution is the Docker image.

Of course you can also just download the source code and use Node v22 and yarn/npm to start the service (but be sure to configure it first).

## Run & Configuration

At the moment there is no UI to configure it, so you must use environment variables during startup.
Either add the environment variables via docker / docker compose or add an .env file:

⚠️ You must set `SPOOLMAN_USE_LOT_NR_FOR_PRUSAMENT_ID=1` for now. This means the LotNr will be set and used for the prusament spool

⚠️ Currently there is no way to filter by extra data and this is the easiest solution to rely on LotNr, but in upcoming verions extra field only will be possible too!

⚠️ This service assumes there is no or only one Prusament Manufactor added yet (it will create one or reuse the first it finds)
⚠️ This service assumes there is only one filament type per color added yet (it will create one or reuse the first it finds) - if you created multiple (like standard spool, refill spool) then this service will atm report an error - upcoming versions will handle this more gently and better

```sh
docker run -d --restart unless-stopped \
  -v "/opt/spoolment-bridge/.env:/dist/.env" \
  -p 5030:5030 \
  -e SPOOLMAN_BASE_URL=http://localhost:7912 \
  -e SPOOLMAN_USE_LOT_NR_FOR_PRUSAMENT_ID=1 \
  -e SPPOLMAN_EXTRA_SPOOL_KEY_PRUSAMENT_ID=prusament_spool_id \
  thedelta/spoolment-bridge:latest
```

Dockerfile
```yaml
services:
  spoolment-bridge:
    image: thedelta/spoolment-bridge:latest
    restart: unless-stopped
    volumes:
        # link .env to dist folder
      - type: bind
        source: ./.env
        target: /dist/.env
    ports:
      - "5030:5030"
    environment:
      - SPOOLMAN_BASE_URL=http://localhost:7912
      - SPOOLMAN_USE_LOT_NR_FOR_PRUSAMENT_ID=1
      - SPPOLMAN_EXTRA_SPOOL_KEY_PRUSAMENT_ID=prusament_spool_id
```

.env File
```ini
SPOOLMAN_BASE_URL=http://localhost:7912
SPOOLMAN_USE_LOT_NR_FOR_PRUSAMENT_ID=1
SPPOLMAN_EXTRA_SPOOL_KEY_PRUSAMENT_ID=prusament_spool_id
```

Clone repository and use source code directly (Don't forget to create and setup the .env file or use environment variables)

- `yarn ci:build`
- `yarn build`
- `yarb start:prod`

## Options

| Key | Default | Description |
| --- | ----- | ----- |
| `SPOOLMAN_BASE_URL` | - | 🔺 Must be set to the base domain of Spoolman, otherwise the service won't start !
| `SPOOLMAN_USE_LOT_NR_FOR_PRUSAMENT_ID` | 0 | 🔺 This must be set to 1 right now unfortunately for full functionallity!
| `SPPOLMAN_EXTRA_SPOOL_KEY_PRUSAMENT_ID` | - | (Optional) Key which will be used where the spoolId of Prusament is stored. Can be used in the future to find / reference the spool. It will be automatically created if it doesn't exist


## Development

- NodeJS 22 & yarn
- `yarn install` & `yarn dev` to start, with watch and debugger support

## Roadmap

- Backend
  - Import / Export to OctoPrint FilamentManager
  - Support `extra_field` only (requires https://github.com/Donkie/Spoolman/issues/600)
  - Better validation, utilize better and custom exceptions and errors
  - Hook up with websockets API to react to realtime changes
  - Caching
  - More best practices
- Frontend
  - Replaced hacked together UI with minimal Angular UI
- General
  - Dynamic configuration
  - Unit tests
  - Build pipeline (I never used GitHub for that yet 😅)
  - Angular Frontend
  - Migrate to https://github.com/hey-api/openapi-ts/issues/1481 once ready :)


## Resources

- https://donkie.github.io/Spoolman/
- https://openapi-generator.tech/docs/generators/typescript-nestjs/
- https://w3c.github.io/web-nfc/#dfn-nfc-forum-type-5 & https://developer.chrome.com/docs/capabilities/nfc