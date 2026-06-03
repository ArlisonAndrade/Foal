// api/grupamentos.js — Vercel Serverless Function
// GET: carrega grupamentos salvos | POST: salva grupamentos

export default async function handler(req, res) {
  const headers = {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
  };

  if (req.method === "POST") {
    // Salva grupamento como página no Notion
    const { chave, grupamentos, instrutor, curso, turma } = req.body;
    try {
      const resp = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers,
        body: JSON.stringify({
          parent: { database_id: process.env.NOTION_GRUPAMENTOS_DB_ID || process.env.NOTION_DATABASE_ID },
          properties: {
            Chave:       { title: [{ text: { content: chave } }] },
            Instrutor:   { rich_text: [{ text: { content: instrutor } }] },
            Curso:       { select: { name: curso } },
            Turma:       { rich_text: [{ text: { content: turma } }] },
            Grupamentos: { rich_text: [{ text: { content: JSON.stringify(grupamentos) } }] },
            Status:      { select: { name: "Ativo" } },
          },
        }),
      });
      if (!resp.ok) throw new Error("Erro ao salvar");
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === "GET") {
    const { chave } = req.query;
    try {
      const resp = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          filter: { property: "Chave", rich_text: { equals: chave } },
          sorts: [{ property: "created_time", direction: "descending" }],
          page_size: 1,
        }),
      });
      const data = await resp.json();
      if (data.results && data.results.length > 0) {
        const page = data.results[0];
        const raw = page.properties?.Grupamentos?.rich_text?.[0]?.text?.content;
        if (raw) return res.status(200).json({ found: true, grupamentos: JSON.parse(raw) });
      }
      return res.status(200).json({ found: false });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
