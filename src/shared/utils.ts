export const extractFixedText = (output?: string) => {
  if (!output) return "";

  return (
    output.split("**Corrected Text:**")[1]?.split("\n\n---")[0]?.trim() || ""
  );
};
