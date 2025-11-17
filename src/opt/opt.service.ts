import { Injectable } from '@nestjs/common';

import * as yaml from 'js-yaml';
import child_process, { spawn } from 'node:child_process';
/*
https://docs.nestjs.com/providers#services
*/
import util from 'node:util';
import { join } from 'path';

const execFile = util.promisify(child_process.execFile);

@Injectable()
export class OptService {
  public async initializeTag(
    size = 304,
    auxRegion = 32,
  ): Promise<{ mimeType: string; payloadBase64: string; fullBase64: string }> {
    try {
      const { stdout, stderr } = await execFile('python', [
        join(__dirname, '../assets/opt_wrapper/nfc_init_payload.py'),
        '--size',
        `${size}`,
        '--aux-region',
        `${auxRegion}`,
      ]);

      if (stderr) {
        throw new Error(stderr);
      }

      const [mimeType, base64Payload, base64Full] = JSON.parse(stdout) as [
        string,
        string,
        string,
      ];

      // Convert base64 string to Buffer
      const payloadBase64 = Buffer.from(base64Payload, 'base64').toString(
        'base64',
      );
      const fullBase64 = Buffer.from(base64Full, 'base64').toString('base64');

      return { mimeType, payloadBase64, fullBase64 };
    } catch (error) {
      console.error('Error executing python script:', error);
      throw error;
    }
  }

  buildFullTag(ndefData, tagSize) {
    // Capability Container - similar to Python example
    const capabilityContainer = Buffer.from([
      0xe1, // Magic number
      0x40 | 0x0, // Version 1.0 with read/write access
      tagSize / 8, // Tag size in 8-byte blocks
      0x01, // MBREAD capability flag
    ]);

    // Verify tagSize divisibility and limits if needed here

    // TLV terminator byte
    const tlvTerminator = Buffer.from([0xfe]);

    // Calculate NDEF TLV header length
    let ndefTlvHeader;
    const ndefMessageLength =
      tagSize - capabilityContainer.length - tlvTerminator.length;

    if (ndefMessageLength <= 0xfe) {
      ndefTlvHeader = Buffer.from([0x03, ndefMessageLength]);
    } else {
      ndefTlvHeader = Buffer.from([
        0x03, // NDEF message TLV tag
        0xff,
        (ndefMessageLength >> 8) & 0xff,
        ndefMessageLength & 0xff,
      ]);
    }

    // Build full tag as Buffer of correct size
    const fullData = Buffer.alloc(tagSize);

    // Copy each section into the fullData buffer
    let offset = 0;
    capabilityContainer.copy(fullData, offset);
    offset += capabilityContainer.length;

    ndefTlvHeader.copy(fullData, offset);
    offset += ndefTlvHeader.length;

    ndefData.copy(fullData, offset);
    offset += ndefData.length;

    // Pad zeros if there's any leftover space before terminator
    if (offset < tagSize - 1) {
      fullData.fill(0, offset, tagSize - 1);
      offset = tagSize - 1;
    }

    tlvTerminator.copy(fullData, offset);

    return fullData;
  }

  public async readTag(payloadBase64: string) {
    const fullTag = this.buildFullTag(
      Buffer.from(payloadBase64, 'base64'),
      320,
    );
    console.log(fullTag);

    const out = await this.callPythonWithInput(fullTag, 'rec_info.py', [
      '--show-data',
      // '--opt-check',
    ]);

    console.log(out);

    return yaml.load(out);
  }

  public async writeTag(payloadBase64: string) {
    console.log('writeTag', payloadBase64);

    const out = await this.callPythonWithInput(payloadBase64, 'rec_update.py', [
      'sample_data/data_to_fill.yaml',
      // join(__dirname, '../assets/opt/utils/sample_data/data_to_fill.yaml'),
    ]);

    console.log(out);
  }

  private async callPythonWithInput(
    input: string | Buffer<ArrayBufferLike>,
    pyScript: string,
    args: string[] = [],
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Decode base64 to buffer
      const inputBuffer =
        typeof input === 'string' ? Buffer.from(input, 'base64') : input;

      // Spawn the Python process with desired args
      const pyProcess = spawn('python', [
        join(__dirname, `../assets/opt/utils/${pyScript}`),
        ...args,
      ]);

      let stdoutData = '';
      let stderrData = '';

      pyProcess.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString();
      });

      pyProcess.stderr.on('data', (chunk) => {
        stderrData += chunk.toString();
      });

      pyProcess.on('close', (code) => {
        if (code === 0) {
          resolve(stdoutData);
        } else {
          reject(new Error(`Python exited with code ${code}: ${stderrData}`));
        }
      });

      pyProcess.on('error', (err) => reject(err));

      pyProcess.stdin.write(inputBuffer);
      pyProcess.stdin.end();
    });
  }
}
