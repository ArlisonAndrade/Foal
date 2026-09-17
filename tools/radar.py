import requests
import json
import os
import dotenv # type: ignore

dotenv.load_dotenv()

NOTION_API_KEY = os.getenv("NOTION_API_KEY")
HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
}

# Em vez de buscar por 'database', vamos buscar TUDO o que a integração consegue ver
print("📡 Radar de Alta Frequência ligado...")
url = "https://api.notion.com/v1/search"
payload = {"page_size": 50} 
resp = requests.post(url, headers=HEADERS, json=payload)
data = resp.json()

for item in data.get("results", []):
    titulo = "Sem Nome"
    if item.get("object") == "database":
        if item.get("title"):
            titulo = item["title"][0].get("plain_text")
        print(f"✅ TABELA ENCONTRADA: {titulo}")
        print(f"👉 ID: {item['id']}")
    else:
        # Se for uma página, mostra o título pra gente localizar
        if item.get("properties") and item["properties"].get("title"):
             print(f"📄 Página: {item['properties']['title']['title'][0]['plain_text']} (ID: {item['id']})")