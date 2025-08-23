'use strict';
import * as https from 'node:https';
import { URL } from 'node:url';

class InvalidURLError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidURLError';
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class HTTPError extends Error {
  public readonly statusCode: number | undefined;
  constructor(statusCode: number | undefined, message: string) {
    super(message);
    this.name = 'HTTPError';
    this.statusCode = statusCode;
  }
}

/**
 * GET over HTTPS and return the body as text.
 * @param uri HTTPS URL.
 * @returns Response body.
 */
export function fetchHttpsContent(uri: string | URL): Promise<string> {
  return new Promise((resolve, reject) => {
    const urlStr = uri.toString();

    // HTTPS only
    if (!urlStr.startsWith('https://')) {
      return reject(
        new InvalidURLError(`Only https protocol is supported. Received: ${urlStr}`)
      );
    }

    const req = https.get(uri, (response) => {
      const { statusCode, statusMessage } = response;
      let data = '';

      response.on('data', (chunk: Buffer | string) => {
        data += chunk as string;
      });

      response.on('end', () => {
        if (statusCode && statusCode >= 200 && statusCode < 300) {
          return resolve(data);
        }
        // Non-2xx -> HTTPError
        reject(
          new HTTPError(
            statusCode,
            `Request failed with status ${statusCode ?? 'unknown'}${
              statusMessage ? ` ${statusMessage}` : ''
            }` + (data ? `: ${data}` : '')
          )
        );
      });

      response.on('error', (err) => {
        reject(new NetworkError(`Response error: ${(err as Error).message}`));
      });
    });

    // Timeout: 15s
    req.setTimeout(15000, () => {
      req.destroy(new Error('Request timed out'));
    });

    req.on('error', (err) => {
      reject(new NetworkError(`Network error while requesting ${urlStr}: ${err.message}`));
    });
  });
}

/**
 * GET over HTTPS and return the body as a Buffer.
 * @param uri HTTPS URL.
 * @returns Response body as Buffer.
 */
export function fetchHttpsBuffer(uri: string | URL): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const urlStr = uri.toString();

    // HTTPS only
    if (!urlStr.startsWith('https://')) {
      return reject(
        new InvalidURLError(`Only https protocol is supported. Received: ${urlStr}`)
      );
    }

    const req = https.get(uri, (response) => {
      const { statusCode, statusMessage } = response;
      const chunks: Buffer[] = [];

      response.on('data', (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      response.on('end', () => {
        const buf = Buffer.concat(chunks as unknown as readonly Uint8Array[]);
        if (statusCode && statusCode >= 200 && statusCode < 300) {
          return resolve(buf);
        }
        // Non-2xx -> HTTPError
        reject(
          new HTTPError(
            statusCode,
            `Request failed with status ${statusCode ?? 'unknown'}${
              statusMessage ? ` ${statusMessage}` : ''
            }` + (buf.length ? `: ${buf.toString('utf8')}` : '')
          )
        );
      });

      response.on('error', (err) => {
        reject(new NetworkError(`Response error: ${(err as Error).message}`));
      });
    });

    // Timeout: 15s
    req.setTimeout(15000, () => {
      req.destroy(new Error('Request timed out'));
    });

    req.on('error', (err) => {
      reject(new NetworkError(`Network error while requesting ${urlStr}: ${err.message}`));
    });
  });
}
