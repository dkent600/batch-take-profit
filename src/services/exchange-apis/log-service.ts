async function handleError(err: unknown) {
  if (err instanceof Error) {
    err.message = err.message
      .replace(API_KEY || '', '[REDACTED_API_KEY]')
      .replace(API_SECRET || '', '[REDACTED_API_SECRET]')
      .replace(process.env.VPN_IP || '', '[REDACTED_VPN_IP]')
      .replace(process.env.TELEGRAM_BOT_TOKEN || '', '[REDACTED_BOT_TOKEN]');
  }

  try {
    await sendTelegramMessage(errorToTelegramMessage(err));
  } catch { }

  if (err instanceof Error) {
    log(err.stack ?? err.message);
  } else {
    log(String(err));
  }
};
