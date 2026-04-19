import baseX from "base-x";
import crypto from "crypto";

const prefixes = [
  "tag_", //tag
  "todo_", //todo
] as const;

// ULID uses base32 encoding
const base32 = baseX("0123456789ABCDEFGHJKMNPQRSTVWXYZ");

//Create 128bit ULID-compatible buffer (48 bits for timestamp + 80 bits for randomness)
function createULIDBuffer(): Uint8Array {
  const buf = new Uint8Array(16); // 128 bits

  const timestamp = BigInt(Date.now());
  buf[0] = Number((timestamp >> BigInt(40)) & BigInt(255));
  buf[1] = Number((timestamp >> BigInt(32)) & BigInt(255));
  buf[2] = Number((timestamp >> BigInt(24)) & BigInt(255));
  buf[3] = Number((timestamp >> BigInt(16)) & BigInt(255));
  buf[4] = Number((timestamp >> BigInt(8)) & BigInt(255));
  buf[5] = Number(timestamp & BigInt(255));

  //randomness (80 bits = 10 bytes)
  crypto.getRandomValues(buf.subarray(6));

  return buf;
}

//create 128bit unique id in Base 32
export const createId = ({ prefix }: { prefix: (typeof prefixes)[number] }) => {
  const buf = createULIDBuffer();
  const id = base32.encode(buf);

  return `${prefix}${id}`;
};
