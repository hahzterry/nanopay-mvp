import dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env' : '../.env' });
dotenv.config();

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? 3001),
  FRONTEND_ORIGIN: requireEnv('FRONTEND_ORIGIN', 'http://localhost:5173'),
  CIRCLE_API_KEY: requireEnv('CIRCLE_API_KEY'),
  CIRCLE_ENTITY_SECRET: requireEnv('CIRCLE_ENTITY_SECRET'),
  WALLET_SET_ID: requireEnv('WALLET_SET_ID'),
  ENABLE_GATEWAY_EXPERIMENTAL: process.env.ENABLE_GATEWAY_EXPERIMENTAL === 'true',
  GATEWAY_API_BASE: process.env.GATEWAY_API_BASE ?? 'https://gateway-api-testnet.circle.com',
  ENABLE_GATEWAY_DEPOSIT: process.env.ENABLE_GATEWAY_DEPOSIT === 'true',
  GATEWAY_WALLET_ADDRESS: process.env.GATEWAY_WALLET_ADDRESS,
  GATEWAY_MINTER_ADDRESS: process.env.GATEWAY_MINTER_ADDRESS
} as const;

export const ARC_TESTNET = 'ARC-TESTNET' as const;
export const ARC_TESTNET_USDC_TOKEN_ID = 'ef87c8c3-85de-598a-af50-c5135eecfa74';
export const ARC_TESTNET_USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
