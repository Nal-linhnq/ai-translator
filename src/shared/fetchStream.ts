/* eslint-disable @typescript-eslint/no-explicit-any */
export async function fetchStream(
  url: string,
  requestBody: Record<string, any>,
  onChunkReceived: (chunk: string) => void,
  setIslLoading: (isLoading: boolean) => void
): Promise<void> {
  try {
    const isFormData = requestBody instanceof FormData;

    const response = await fetch(url, {
      method: "POST",
      headers: isFormData ? {} : { "Content-Type": "application/json" },
      body: isFormData ? requestBody : JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("ReadableStream not supported or empty response.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      accumulatedText += chunk;
      onChunkReceived(accumulatedText);
    }

    setIslLoading(false);
  } catch (error) {
    console.error("Streaming error:", error);
    onChunkReceived(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
