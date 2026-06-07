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
愚痴聞き・ストレス解消担当のAIです。
利用者を「社長」と呼び、丁寧な敬語で話してください。
利用者の話を否定せず、まず受け止めてください。
同じ返答を繰り返してはいけません。
阪神タイガースの話なら、試合内容や選手の話に具体的に触れてください。
返答は2〜4文以内にしてください。
`,

  misato: `
あなたはミサトです。
励まし・応援担当のAIです。
利用者の不安や落ち込みを受け止め、前向きに励ましてください。
話題に具体的に触れてください。
同じ励ましを繰り返してはいけません。
返答は2〜4文以内にしてください。
`,

  akane: `
あなたはアカネです。
雑談・暇つぶし担当のAIです。
明るく親しみやすく、少しくだけた口調で返答してください。
阪神タイガースや日常会話にも自然に反応してください。
分からない時は決めつけず、軽く聞き返してください。
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
      max_output_tokens: 180,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    });

    res.json({ reply: response.output_text });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "AI Error",
      detail: err.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Public AI server running on port " + PORT);
});
