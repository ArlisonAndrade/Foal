// api/salvar.js — Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { registros } = req.body;
  if (!Array.isArray(registros)) return res.status(400).json({ error: "Dados inválidos" });

  const erros = [];
  const salvos = [];

  for (const r of registros) {
    try {
      const props = {
        Aluno:     { title: [{ text: { content: r.aluno || "—" } }] },
        Instrutor: { rich_text: [{ text: { content: r.instrutor || "—" } }] },
        Curso:     { select: { name: r.curso || "CAVALARIA" } },
        Turma:     { rich_text: [{ text: { content: r.turma || "—" } }] },
        Tipo:      { select: { name: r.tipo || "CFGS" } },
        Status:    { select: { name: r.status === "avaliado" ? "Avaliado" : "Não Realizou" } },
        Data:      { date: { start: r.data || new Date().toISOString().split("T")[0] } },
        Momento:   r.momento ? { select: { name: r.momento } } : undefined,
      };

      // Notas por atributo
      if (r.resultados) {
        for (const [attr, dados] of Object.entries(r.resultados)) {
          if (dados.nota !== null) {
            if (dados.nota !== null) props[`${dados.nome} — Nota`] = { number: dados.nota };
            props[`${dados.nome} — Menção`] = { select: { name: dados.mencao || "NO" } };
          } else {
            props[`${dados.nome} — Menção`] = { select: { name: "NO" } };
          }
        }
      }

      // Fatos Observados
      if (r.fatos && r.fatos.length > 0) {
        props["Fatos Observados"] = { rich_text: [{ text: { content: r.fatos.join(" | ") } }] };
      }

      // Observações
      if (r.observacoes) {
        props["Observações"] = { rich_text: [{ text: { content: r.observacoes } }] };
      }

      const resp = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          parent: { database_id: process.env.NOTION_DATABASE_ID },
          properties: props,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        erros.push({ aluno: r.aluno, erro: err.message });
      } else {
        salvos.push(r.aluno);
      }
    } catch (e) {
      erros.push({ aluno: r.aluno, erro: e.message });
    }
  }

  if (erros.length > 0) return res.status(207).json({ parcial: true, salvos: salvos.length, erros });
  return res.status(200).json({ success: true, salvos: salvos.length });
}
