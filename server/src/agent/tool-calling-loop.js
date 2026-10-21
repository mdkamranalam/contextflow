import { registeredToolDefinitions } from "../tools/definitions.js";
import { executeTool } from "../tools/executor.js";

export async function runToolCallingLoop({
  groqClient,
  model = process.env.GROQ_MODEL || "openai/gpt-oss-20b",
  messages,
  maxRounds = parseInt(process.env.MAX_TOOL_ROUNDS || "4", 10),
}) {
  const conversation = [...messages];
  const toolEvents = [];
  let rounds = 0;

  while (rounds < maxRounds) {
    rounds += 1;

    const response = await groqClient.chat.completions.create({
      model,
      messages: conversation,
      tools: registeredToolDefinitions,
      tool_choice: "auto",
    });

    const choice = response.choices?.[0];
    const message = choice?.message;

    if (!message) {
      throw new Error("Received an empty response from the AI model");
    }

    conversation.push(message);

    if (!message.tool_calls || message.tool_calls.length === 0) {
      return {
        finalAnswer: message.content || "",
        conversation,
        toolEvents,
        rounds,
      };
    }

    for (const toolCall of message.tool_calls) {
      const toolName = toolCall.function?.name;
      let toolArgs = {};

      try {
        toolArgs = toolCall.function?.arguments
          ? JSON.parse(toolCall.function.arguments)
          : {};
      } catch (err) {
        const errorContent = JSON.stringify({
          error: `Invalid JSON arguments: ${err.message}`,
        });
        conversation.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: errorContent,
        });
        toolEvents.push({ tool: toolName, success: false, error: err.message });
        continue;
      }

      try {
        const result = executeTool(toolName, toolArgs);
        conversation.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
        toolEvents.push({
          tool: toolName,
          success: true,
          summary: `Executed ${toolName}`,
        });
      } catch (err) {
        conversation.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: err.message }),
        });
        toolEvents.push({ tool: toolName, success: false, error: err.message });
      }
    }
  }

  // If max rounds reached while model is still requesting tools
  return {
    finalAnswer:
      "I reached the maximum number of tool execution steps. Please let me know how you would like to proceed.",
    conversation,
    toolEvents,
    rounds,
  };
}
