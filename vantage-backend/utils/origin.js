const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);
const PUBLIC_URL_ENV_KEYS = ['APP_URL', 'FRONTEND_URL', 'CLIENT_URL'];

const normalizeOrigin = (value) => {
  if (!value) return null;

  try {
    const parsed = new URL(value);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
};

export const getConfiguredOrigins = () => {
  const origins = PUBLIC_URL_ENV_KEYS.flatMap((key) =>
    (process.env[key] || '')
      .split(',')
      .map((value) => normalizeOrigin(value.trim()))
      .filter(Boolean)
  );

  return [...new Set(origins)];
};

export const isLocalOrigin = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return false;

  const { hostname } = new URL(normalizedOrigin);
  return LOCAL_HOSTNAMES.has(hostname);
};

export const isAllowedBrowserOrigin = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return false;

  if (getConfiguredOrigins().includes(normalizedOrigin)) {
    return true;
  }

  if (process.env.NODE_ENV !== 'production') {
    return isLocalOrigin(normalizedOrigin);
  }

  return new URL(normalizedOrigin).protocol === 'https:';
};

export const resolvePublicAppUrl = (candidateOrigin) => {
  const normalizedCandidateOrigin = normalizeOrigin(candidateOrigin);
  if (normalizedCandidateOrigin && isAllowedBrowserOrigin(normalizedCandidateOrigin)) {
    return normalizedCandidateOrigin;
  }

  const [configuredOrigin] = getConfiguredOrigins();
  if (configuredOrigin) {
    return configuredOrigin;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:5173';
  }

  throw {
    statusCode: 500,
    message: 'Unable to determine the public app URL for checkout redirects',
  };
};
