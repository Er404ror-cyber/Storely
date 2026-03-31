const CLOUD_NAME = 'dcffpnzxn';
const UPLOAD_PRESET = 'produtos_preset';

export interface CloudinaryUploadResult {
  url: string;
  delete_token?: string;
}

export interface CloudinaryDeleteResult {
  ok: boolean;
  status: 'deleted' | 'expired_or_failed' | 'unknown';
  message?: string;
  raw?: unknown;
}

export const uploadToCloudinary = async (
  file: File
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Cloudinary upload failed');
  }

  return {
    url: data.secure_url,
    delete_token: data.delete_token,
  };
};

export const deleteFromCloudinary = async (
  token: string
): Promise<CloudinaryDeleteResult> => {
  const formData = new FormData();
  formData.append('token', token);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/delete_by_token`,
    {
      method: 'POST',
      body: formData,
    }
  );

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  console.log('[Cloudinary] delete_by_token response:', data);

  if (response.ok) {
    return {
      ok: true,
      status: 'deleted',
      raw: data,
    };
  }

  return {
    ok: false,
    status: 'expired_or_failed',
    message: data?.error?.message || 'Cloudinary delete failed',
    raw: data,
  };
};