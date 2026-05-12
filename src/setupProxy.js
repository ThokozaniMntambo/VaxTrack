const express = require("express");
const https = require("https");
const { sendReminders } = require("../api/reminderSender");

const DEFAULT_MODEL = "gpt-5.4-nano";

function extractResponseText(data) {
  if (data.output_text) {
    return data.output_text;
  }

  const outputText = data.output
    ?.flatMap((item) => item.content || [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n")
    .trim();

  if (outputText) {
    return outputText;
  }

  return "";
}

function postOpenAI(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);

    const request = https.request(
      {
        hostname: "api.openai.com",
        path: "/v1/responses",
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (response) => {
        let rawData = "";

        response.on("data", (chunk) => {
          rawData += chunk;
        });

        response.on("end", () => {
          try {
            resolve({
              ok: response.statusCode >= 200 && response.statusCode < 300,
              status: response.statusCode,
              data: JSON.parse(rawData),
            });
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

module.exports = function setupChatProxy(app) {
  app.use(express.json());

  app.post("/api/chat", async (req, res) => {
    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
      return;
    }

    const { model = DEFAULT_MODEL, messages = [] } = req.body || {};

    try {
      const openAIResponse = await postOpenAI({
        model,
        input: messages,
        max_output_tokens: 300,
      });

      if (!openAIResponse.ok) {
        res.status(openAIResponse.status).json({
          error: openAIResponse.data.error?.message || "OpenAI request failed",
        });
        return;
      }

      const reply = extractResponseText(openAIResponse.data);

      if (!reply) {
        res.status(502).json({
          error: `OpenAI returned no text. Response status: ${openAIResponse.data.status || "unknown"}`,
        });
        return;
      }

      res.status(200).json({ reply });
    } catch (error) {
      res.status(500).json({ error: error.message || "Chat request failed" });
    }
  });

  app.post("/api/reminders", async (req, res) => {
    try {
      const result = await sendReminders(req.body || {});
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message || "Reminder request failed" });
    }
  });
};
