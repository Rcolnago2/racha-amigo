/**
 * Generates a PIX EMV payload string for static QR codes.
 * Based on the BR Code / EMV standard for PIX.
 */

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function generatePixPayload(
  pixKey: string,
  merchantName: string,
  merchantCity: string,
  amount: number,
  description?: string
): string {
  // Payload Format Indicator
  let payload = tlv("00", "01");

  // Merchant Account Information (GUI + key)
  let mai = tlv("00", "br.gov.bcb.pix");
  mai += tlv("01", pixKey);
  if (description) {
    mai += tlv("02", description.substring(0, 25));
  }
  payload += tlv("26", mai);

  // Merchant Category Code
  payload += tlv("52", "0000");

  // Transaction Currency (986 = BRL)
  payload += tlv("53", "986");

  // Transaction Amount
  payload += tlv("54", amount.toFixed(2));

  // Country Code
  payload += tlv("58", "BR");

  // Merchant Name
  payload += tlv("59", merchantName.substring(0, 25));

  // Merchant City
  payload += tlv("60", merchantCity.substring(0, 15));

  // Additional Data Field (txid)
  const addData = tlv("05", "***");
  payload += tlv("62", addData);

  // CRC placeholder
  payload += "6304";

  // Calculate CRC16
  const crc = crc16(payload);
  payload += crc;

  return payload;
}
