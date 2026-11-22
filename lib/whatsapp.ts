import { normalizeWhatsAppNumber } from '@/lib/crm-shared';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

type TwilioWhatsAppConfig = {
  accountSid: string;
  authToken: string;
  from: string;
};

export type WhatsAppProviderStatus = {
  configured: boolean;
  provider: 'twilio' | null;
  source: 'env' | 'runtime' | null;
};

export type WhatsAppSendResult = {
  messageId: string;
  provider: 'twilio';
  status: string;
};

async function readRuntimeTwilioConfig(): Promise<(TwilioWhatsAppConfig & { connected: boolean }) | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from('whatsapp_config')
    .select('account_sid, auth_token, sender, connected')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw new Error('Could not read WhatsApp settings from Supabase.');
  return data && {
    accountSid: data.account_sid,
    authToken: data.auth_token,
    from: data.sender,
    connected: data.connected,
  };
}

function getTwilioConfig(): TwilioWhatsAppConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim() || '';
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim() || '';
  const from = process.env.TWILIO_WHATSAPP_FROM?.trim() || '';

  if (!accountSid || !authToken || !from) {
    return null;
  }

  return { accountSid, authToken, from };
}

export async function saveRuntimeTwilioConfig(input: TwilioWhatsAppConfig, validate: boolean) {
  const accountSid = input.accountSid;
  const sender = normalizeWhatsAppNumber(input.from.replace(/^whatsapp:/i, ''));
  if (!/^AC[0-9a-f]{32}$/i.test(accountSid) || !sender) {
    throw new Error('Enter a valid Twilio Account SID and WhatsApp sender number.');
  }
  const saved = await readRuntimeTwilioConfig();
  const authToken = input.authToken || (saved?.accountSid === accountSid ? saved.authToken : '');
  if (!authToken) throw new Error('Twilio Auth Token is required.');
  const from = `+${sender}`;

  if (!validate && saved?.accountSid === accountSid && saved.authToken === authToken &&
      saved.from === from) return;

  if (validate) {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
      {
        headers: { Authorization: `Basic ${auth}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (!response.ok) {
      throw new Error(`Twilio account validation failed (HTTP ${response.status}).`);
    }
  }

  const { error } = await getSupabaseAdminClient().from('whatsapp_config').upsert({
    id: 1,
    account_sid: accountSid,
    auth_token: authToken,
    sender: from,
    connected: validate,
  });
  if (error) throw new Error('Could not save WhatsApp settings to Supabase.');
}

export async function clearRuntimeTwilioConfig() {
  const { error } = await getSupabaseAdminClient().from('whatsapp_config').delete().eq('id', 1);
  if (error) throw new Error('Could not clear WhatsApp settings from Supabase.');
}

export async function getWhatsAppProviderStatus(): Promise<WhatsAppProviderStatus & {
  accountSid: string;
  from: string;
  hasAuthToken: boolean;
}> {
  const runtimeConfig = await readRuntimeTwilioConfig();
  const configured = Boolean(runtimeConfig?.connected || getTwilioConfig());
  return {
    configured,
    provider: configured ? 'twilio' : null,
    source: runtimeConfig?.connected ? 'runtime' : configured ? 'env' : null,
    accountSid: runtimeConfig?.accountSid ?? '',
    from: runtimeConfig?.from ?? '',
    hasAuthToken: Boolean(runtimeConfig),
  };
}

async function getResolvedTwilioConfig() {
  const saved = await readRuntimeTwilioConfig();
  return saved?.connected ? saved : getTwilioConfig();
}

export async function sendWhatsAppMessage(input: {
  body: string;
  to: string;
}): Promise<WhatsAppSendResult> {
  const twilio = await getResolvedTwilioConfig();
  if (!twilio) {
    throw new Error(
      'Direct WhatsApp sending is not configured. Add Twilio credentials from admin or environment variables.'
    );
  }

  const normalizedTo = normalizeWhatsAppNumber(input.to);
  if (!normalizedTo) {
    throw new Error('No valid WhatsApp number found for this lead.');
  }

  const body = input.body.trim();
  if (!body) {
    throw new Error('WhatsApp message body is empty.');
  }

  const auth = Buffer.from(`${twilio.accountSid}:${twilio.authToken}`).toString('base64');
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({
        Body: body,
        From: `whatsapp:${twilio.from}`,
        To: `whatsapp:+${normalizedTo}`,
      }),
    }
  );

  const result = (await response.json()) as {
    code?: number;
    message?: string;
    sid?: string;
    status?: string;
  };

  if (!response.ok || !result.sid) {
    throw new Error(result.message || 'Failed to send the WhatsApp message.');
  }

  return {
    messageId: result.sid,
    provider: 'twilio',
    status: result.status || 'queued',
  };
}
