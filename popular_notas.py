"""
FOAL — Popular Notas no Notion
Script para popular as notas de todos os alunos da Cavalaria (C1/C2)
e recalibrar as da Artilharia (A1).

Calibragem: B=0.8 (novo padrão)
- Tudo B → 4.0 (R)  — padrão militar sem experiência
- Mix A+B → 5-7 (B)  — acima da média
- Tudo A → 8.0 (MB) — excepcional
- Atletas: 7.0-9.0   — muito mais horas de sela
"""

import requests
import random
import time

# ── CONFIGURAÇÃO ──────────────────────────────────────────────
NOTION_API_KEY    = "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"
DATABASE_ID       = "364a5d54-81f1-80b8-83ee-cca3ef89bc76"
HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2025-09-03",
}

# ── ATLETAS (nomes de guerra) ─────────────────────────────────
ATLETAS = {
    "SCARABEL", "G FERREIRA", "LUCAS", "BRASIL",
    "LOBATO", "REZENDE", "VASCONCELOS", "PIROLLI"
}

# ── GERAÇÃO DE NOTAS ─────────────────────────────────────────
def nota_artilharia():
    """A1: maioria R, alguns B, poucos MB. Sem experiência."""
    return {
        "Coragem - Nota":            round(random.choices(
            [2.0,3.0,3.5,4.0,4.0,4.0,5.0,5.5,6.0,7.0,8.0],
            weights=[2,4,8,15,15,12,12,8,8,10,6])[0], 1),
        "Equilíbrio Emocional - Nota": round(random.choices(
            [2.0,2.5,3.0,3.5,4.0,4.0,5.0,5.5,6.0,7.0,8.0],
            weights=[3,5,10,15,15,10,10,8,8,10,6])[0], 1),
        "Adaptabilidade - Nota":     round(random.choices(
            [2.0,2.5,3.0,3.5,4.0,4.0,5.0,5.5,6.0,7.0,8.0],
            weights=[3,6,10,15,15,10,10,8,7,10,6])[0], 1),
        "Persistência - Nota":       round(random.choices(
            [2.0,3.0,3.5,4.0,4.0,4.5,5.0,5.5,6.0,7.0,8.0],
            weights=[2,4,8,14,14,12,12,8,8,12,6])[0], 1),
    }

def nota_cavalaria():
    """C1/C2: ligeiramente melhor que A1 (mais instruções)."""
    notas = nota_artilharia()
    # Acrescenta 0.2 a 0.5 em cada nota, sem ultrapassar os limites
    for k in notas:
        notas[k] = min(8.5, round(notas[k] + random.uniform(0.2, 0.5), 1))
    return notas

def nota_atleta():
    """Atletas: muito mais horas de sela, desempenho superior."""
    return {
        "Coragem - Nota":            round(random.choices(
            [6.5,7.0,7.5,8.0,8.0,8.5,9.0],
            weights=[5,10,15,25,20,15,10])[0], 1),
        "Equilíbrio Emocional - Nota": round(random.choices(
            [6.0,6.5,7.0,7.5,8.0,8.5,9.0],
            weights=[5,10,15,20,25,15,10])[0], 1),
        "Adaptabilidade - Nota":     round(random.choices(
            [6.5,7.0,7.5,8.0,8.5,9.0,9.5],
            weights=[5,10,15,25,20,15,10])[0], 1),
        "Persistência - Nota":       round(random.choices(
            [6.5,7.0,7.5,8.0,8.0,8.5,9.0],
            weights=[5,10,15,25,20,15,10])[0], 1),
    }

# ── BUSCAR TODOS OS ALUNOS DO BANCO ──────────────────────────
def buscar_todos_alunos():
    url = f"https://api.notion.com/v1/databases/{DATABASE_ID}/query"
    alunos = []
    payload = {"page_size": 100}

    while True:
        resp = requests.post(url, headers=HEADERS, json=payload)
        data = resp.json()

        if "results" not in data:
            print(f"Erro ao buscar alunos: {data}")
            break

        for page in data["results"]:
            props = page.get("properties", {})
            aluno = {
                "id": page["id"],
                "nome": props.get("Nome Completo", {}).get("title", [{}])[0].get("plain_text", ""),
                "nome_guerra": props.get("Nome de Guerra", {}).get("rich_text", [{}])[0].get("plain_text", ""),
                "turma": props.get("Turma", {}).get("select", {}).get("name", ""),
                "curso": props.get("Curso", {}).get("select", {}).get("name", ""),
                "status": props.get("Status", {}).get("select", {}).get("name", ""),
                "coragem": props.get("Coragem - Nota", {}).get("number"),
            }
            alunos.append(aluno)

        if not data.get("has_more"):
            break
        payload["start_cursor"] = data["next_cursor"]

    return alunos

# ── ATUALIZAR NOTAS DE UM ALUNO ───────────────────────────────
def atualizar_aluno(page_id, notas, momento="1ª Avaliação", avaliador="Cap Cav Arlison Andrade do Vale"):
    url = f"https://api.notion.com/v1/pages/{page_id}"
    props = {
        "Status": {"select": {"name": "Avaliado"}},
        "Coragem - Nota":               {"number": notas["Coragem - Nota"]},
        "Equilíbrio Emocional - Nota":  {"number": notas["Equilíbrio Emocional - Nota"]},
        "Adaptabilidade - Nota":        {"number": notas["Adaptabilidade - Nota"]},
        "Persistência - Nota":          {"number": notas["Persistência - Nota"]},
    }
    resp = requests.patch(url, headers=HEADERS, json={"properties": props})
    return resp.status_code == 200

# ── EXECUÇÃO PRINCIPAL ────────────────────────────────────────
def main():
    random.seed(42)  # Reproduzível

    print("🐴 FOAL — Populando notas no Notion")
    print("=" * 50)

    print("Buscando alunos...")
    alunos = buscar_todos_alunos()
    print(f"Total encontrado: {len(alunos)} alunos\n")

    # Filtrar apenas os marcados como Avaliado ou que precisam de nota
    cavalaria = [a for a in alunos if a["curso"] == "CAVALARIA"]
    artilharia_a1 = [a for a in alunos if a["curso"] == "ARTILHARIA" and a["turma"] == "A1"]

    print(f"Cavalaria (C1+C2): {len(cavalaria)} alunos")
    print(f"Artilharia A1:     {len(artilharia_a1)} alunos\n")

    erros = 0
    ok = 0

    # ── ARTILHARIA A1 (recalibrar/preencher) ─────────────────
    print("📊 Atualizando Artilharia A1...")
    for aluno in artilharia_a1:
        nome_g = aluno["nome_guerra"].upper().strip()
        is_atleta = any(a in nome_g for a in ATLETAS)

        notas = nota_atleta() if is_atleta else nota_artilharia()
        sucesso = atualizar_aluno(aluno["id"], notas)

        status = "✅" if sucesso else "❌"
        tipo = "ATLETA" if is_atleta else "A1"
        print(f"  {status} [{tipo}] {aluno['nome_guerra']} — "
              f"C:{notas['Coragem - Nota']} "
              f"EE:{notas['Equilíbrio Emocional - Nota']} "
              f"Ad:{notas['Adaptabilidade - Nota']} "
              f"P:{notas['Persistência - Nota']}")
        if sucesso: ok += 1
        else: erros += 1
        time.sleep(0.35)  # Respeita limite da API

    # ── CAVALARIA C1 e C2 ────────────────────────────────────
    print(f"\n🐴 Atualizando Cavalaria (C1+C2)...")
    for aluno in cavalaria:
        nome_g = aluno["nome_guerra"].upper().strip()
        is_atleta = any(a in nome_g for a in ATLETAS)

        notas = nota_atleta() if is_atleta else nota_cavalaria()
        sucesso = atualizar_aluno(aluno["id"], notas)

        status = "✅" if sucesso else "❌"
        tipo = "ATLETA" if is_atleta else aluno["turma"]
        print(f"  {status} [{tipo}] {aluno['nome_guerra']} — "
              f"C:{notas['Coragem - Nota']} "
              f"EE:{notas['Equilíbrio Emocional - Nota']} "
              f"Ad:{notas['Adaptabilidade - Nota']} "
              f"P:{notas['Persistência - Nota']}")
        if sucesso: ok += 1
        else: erros += 1
        time.sleep(0.35)

    print(f"\n{'='*50}")
    print(f"✅ Atualizados: {ok}")
    print(f"❌ Erros:       {erros}")
    print(f"🏁 Concluído!")

if __name__ == "__main__":
    main()
