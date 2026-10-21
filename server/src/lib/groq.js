import Groq from "groq-sdk";

let groqInstance = null;

export function getGroqClient() {
  if (groqInstance) {
    return groqInstance;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "replace_with_your_actual_key") {
    return null;
  }

  groqInstance = new Groq({ apiKey });
  return groqInstance;
}

export function setGroqClient(mockClient) {
  groqInstance = mockClient;
}
