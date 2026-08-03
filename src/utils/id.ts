import * as Crypto from 'expo-crypto';

/**
 * Client-generated identifier. IDs are minted offline so a record never has to
 * wait on a server to know what it is called.
 */
export function createId(): string {
  return Crypto.randomUUID();
}
