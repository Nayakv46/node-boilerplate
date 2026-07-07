import argon2 from "argon2";

/**
 * Hash user password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456, // ~19 MB
    timeCost: 2,
    parallelism: 1,
  });
}

/**
 * Check whether the provided password matches the hash
 */
export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  return await argon2.verify(hash, password);
}
