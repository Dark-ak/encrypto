import crypto from "node:crypto"


const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits
const TAG_LENGTH = 16; // 128 bits


export interface TxtSecureRecord {
    id: string;
    partyId: string;
    createdAt: string;
    payload_nonce: string;
    payload_ct: string;
    payload_tag: string;
    dek_wrap_nonce: string;
    dek_wrapped: string;
    dek_wrap_tag: string;
    alg: "AES-256-GCM";
    mk_version: 1;
}

const validateHex = (hex: string, expectedBytes: number) => {
    if (!/^[0-9a-fA-F]+$/.test(hex)) throw new Error("Invalid hex encoding");
    if (hex.length !== expectedBytes * 2) throw new Error(`Length mismatch: expected ${expectedBytes} bytes`);
}


const encryptRaw = (data: Buffer, key: Buffer) => {
    const iv = crypto.randomBytes(IV_LENGTH)

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

    return {
        ciphertext: encrypted.toString('hex'),
        iv: iv.toString("hex"),
        tag: cipher.getAuthTag().toString("hex")
    }
}


const decryptRaw = (ciphertext: string, key: Buffer, ivHex: string, tagHex: string) => {
    validateHex(ivHex, IV_LENGTH)
    validateHex(tagHex, TAG_LENGTH)


    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"))
    decipher.setAuthTag(Buffer.from(tagHex, "hex"))

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(ciphertext, 'hex')),
        decipher.final()
    ])

    return decrypted
}


export const protect = (payload: any, partyId: string, masterKeyHex: string): TxtSecureRecord => {
    const mk = Buffer.from(masterKeyHex, 'hex')

    const dek = crypto.randomBytes(32)

    const pEnc = encryptRaw(Buffer.from(JSON.stringify(payload)), dek);

    const dEnc = encryptRaw(dek, mk)

    return {
        id: crypto.randomUUID(),
        partyId,
        createdAt: new Date().toISOString(),
        payload_nonce: pEnc.iv,
        payload_ct: pEnc.ciphertext,
        payload_tag: pEnc.tag,
        dek_wrap_nonce: dEnc.iv,
        dek_wrapped: dEnc.ciphertext,
        dek_wrap_tag: dEnc.tag,
        alg: "AES-256-GCM",
        mk_version: 1
    };
}

export const unprotect = (record: TxtSecureRecord, masterKeyHex: string): any => {

    const mk = Buffer.from(masterKeyHex, 'hex')

    const dek = decryptRaw(record.dek_wrapped,mk,record.dek_wrap_nonce, record.dek_wrap_tag)

    const payloadRaw = decryptRaw(record.payload_ct,dek,record.payload_nonce,record.payload_tag)


    return JSON.parse(payloadRaw.toString())
}