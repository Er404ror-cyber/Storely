const CLOUD_NAME = "dcffpnzxn";
const UPLOAD_PRESET = "produtos_preset"; 

export const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return { 
    url: data.secure_url, 
    delete_token: data.delete_token 
  };
};

export const deleteFromCloudinary = async (token: string) => {
  const formData = new FormData();
  formData.append('token', token);
  await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/delete_by_token`, {
    method: 'POST',
    body: formData,
  });
};