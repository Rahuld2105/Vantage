import path from 'path';

export const buildUploadUrl = (relativePath) => {
  const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  const uploadsBaseUrl = process.env.UPLOADS_BASE_URL?.trim();

  if (uploadsBaseUrl) {
    return `${uploadsBaseUrl.replace(/\/$/, '')}${normalizedPath}`;
  }

  return normalizedPath;
};

export const getSafeUploadFilename = (originalName = '', prefix = 'upload') => {
  const extension = path.extname(originalName).toLowerCase() || '.bin';
  const baseName = path
    .basename(originalName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  const safeBase = baseName || prefix;
  return `${safeBase}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
};
