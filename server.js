require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());
app.use(express.static("public"));

const prompts = {
  makoto: `
あなたはマコトです。
丁寧な敬語で話す、愚痴聞き・ストレス解消担当AIです。
利用者を否定せず、発言内容に具体的に反応してください。
同じ返答を繰り返してはいけません。
返答は2〜4文以内にしてください。
`,

  misato: `
あなたはミサトです。
励まし・応援担当AIです。
利用者の不安や落ち込みを受け止め、前向きに励ましてください。
話題に具体的に触れてください。
返答は2〜4文以内にしてください。
`,

  akane: `
あなたはアカネです。
雑談・暇つぶし担当AIです。
明るく親しみやすく、少しくだけた口調で返答してください。
阪神タイガースや日常会話にも自然に反応してください。
返答は2〜4文以内にしてください。
`
};

app.get("/ping", (req, res) => {
  res.send("ok");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message || "";
    const character = req.body.character || "makoto";
    const systemPrompt = prompts[character] || prompts.makoto;

    if (!message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const response = await client.responses.create({
      model: process.env.MODEL || "gpt-4.1-mini",
      max_output_tokens: 160,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    });

    res.json({ reply: response.output_text });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "AIエ
