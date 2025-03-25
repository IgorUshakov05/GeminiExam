require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Логирование заголовков запроса
app.use((req, res, next) => {
  console.log("Headers:", req.headers);
  next();
});

async function getResponse(text) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 секунд

  try {
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text }] }] }),
        signal: controller.signal, 
      }
    );

    clearTimeout(timeoutId);
    let answer = await response.json();
    return answer.candidates?.[0]?.content?.parts?.[0]?.text || "Ошибка: пустой ответ от AI";
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Ошибка: запрос превысил лимит времени");
      return "Ошибка: запрос превысил лимит времени";
    }
    console.error("Ошибка запроса:", error);
    return "Ошибка: " + error.message;
  }
}


app.post("/ask", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      console.error("Ошибка: отсутствует текст запроса");
      return res.status(400).json({ error: "Требуется текст запроса" });
    }

    console.log("Запрос от клиента:", text);

    const responseText = await getResponse(text);
    
    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Ошибка обработки запроса:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`⚡ Сервер запущен на http://localhost:${PORT}`);
});
