export const extractFixedText = (output?: string) => {
  if (!output) return "";

  return (
    output.split("**Corrected Text:**")[1]?.split("\n\n---")[0]?.trim() || ""
  );
};

export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};
