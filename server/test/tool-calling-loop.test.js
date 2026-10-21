import test from "node:test";
import assert from "node:assert/strict";
import { runToolCallingLoop } from "../src/agent/tool-calling-loop.js";
import { initDatabase, closeDatabase } from "../src/db/database.js";

test.beforeEach(() => {
  initDatabase(":memory:");
});

test.afterEach(() => {
  closeDatabase();
});

test("runToolCallingLoop returns final text answer when no tools requested", async () => {
  const mockGroq = {
    chat: {
      completions: {
        create: async () => ({
          choices: [
            {
              message: {
                role: "assistant",
                content: "Hello! I can help you plan your day.",
              },
            },
          ],
        }),
      },
    },
  };

  const result = await runToolCallingLoop({
    groqClient: mockGroq,
    messages: [{ role: "user", content: "Hi" }],
    maxRounds: 3,
  });

  assert.equal(result.finalAnswer, "Hello! I can help you plan your day.");
  assert.equal(result.toolEvents.length, 0);
  assert.equal(result.rounds, 1);
});

test("runToolCallingLoop executes tool call and returns subsequent answer", async () => {
  let callCount = 0;
  const mockGroq = {
    chat: {
      completions: {
        create: async () => {
          callCount += 1;
          if (callCount === 1) {
            return {
              choices: [
                {
                  message: {
                    role: "assistant",
                    content: null,
                    tool_calls: [
                      {
                        id: "call_1",
                        type: "function",
                        function: {
                          name: "create_task",
                          arguments: JSON.stringify({
                            title: "Complete homework",
                            estimatedMinutes: 60,
                            priority: "high",
                          }),
                        },
                      },
                    ],
                  },
                },
              ],
            };
          }
          return {
            choices: [
              {
                message: {
                  role: "assistant",
                  content: 'Task "Complete homework" has been created.',
                },
              },
            ],
          };
        },
      },
    },
  };

  const result = await runToolCallingLoop({
    groqClient: mockGroq,
    messages: [{ role: "user", content: "Create a homework task" }],
    maxRounds: 3,
  });

  assert.equal(
    result.finalAnswer,
    'Task "Complete homework" has been created.',
  );
  assert.equal(result.toolEvents.length, 1);
  assert.equal(result.toolEvents[0].tool, "create_task");
  assert.equal(result.toolEvents[0].success, true);
  assert.equal(result.rounds, 2);
});
