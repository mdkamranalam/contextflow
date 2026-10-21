import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { initDatabase, closeDatabase } from "../src/db/database.js";

test.beforeEach(() => {
  initDatabase(":memory:");
});

test.afterEach(() => {
  closeDatabase();
});

test("GET /api/health returns 200 with service info", async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.service, "contextflow-backend");
    assert.equal(body.database, "connected");
  } finally {
    server.close();
  }
});

test("POST /api/tasks creates task and GET /api/tasks lists it", async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const createRes = await fetch(`http://localhost:${port}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Study math",
        deadline: "2026-10-25",
        estimatedMinutes: 50,
        priority: "high",
      }),
    });
    assert.equal(createRes.status, 201);
    const createdBody = await createRes.json();
    assert.equal(createdBody.task.title, "Study math");
    assert.equal(createdBody.task.estimated_minutes, 50);

    const listRes = await fetch(`http://localhost:${port}/api/tasks`);
    assert.equal(listRes.status, 200);
    const listBody = await listRes.json();
    assert.equal(listBody.tasks.length, 1);
    assert.equal(listBody.tasks[0].title, "Study math");
  } finally {
    server.close();
  }
});

test("GET /api/preferences returns defaults and PUT /api/preferences updates them", async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const getRes = await fetch(`http://localhost:${port}/api/preferences`);
    assert.equal(getRes.status, 200);
    const getBody = await getRes.json();
    assert.equal(getBody.preferences.available_minutes_per_day, 180);

    const putRes = await fetch(`http://localhost:${port}/api/preferences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availableMinutesPerDay: 240 }),
    });
    assert.equal(putRes.status, 200);
    const putBody = await putRes.json();
    assert.equal(putBody.preferences.available_minutes_per_day, 240);
  } finally {
    server.close();
  }
});
