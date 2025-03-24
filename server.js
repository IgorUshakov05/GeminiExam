require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

async function getResponse(text) {
  try {
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    text +
                    " ответь на русском, стэк PySide6, Python, Postgresql, SQLAlchemy",
                },
              ],
            },
          ],
        }),
      }
    );

    let answer = await response.json();
    console.log(answer);
    if (answer.candidates && answer.candidates.length > 0) {
      return answer.candidates[0].content.parts[0].text;
    } else {
      return "Ошибка: пустой ответ от AI";
    }
  } catch (e) {
    return "Ошибка: " + e.message;
  }
}

app.post("/ask", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Требуется текст запроса" });

  const responseText = await getResponse(text);
  res.status(201).json({ response: responseText });
});

app.listen(process.env.PORT, () => {
  console.log(`⚡ Сервер запущен на http://localhost:${process.env.PORT}`);
});
