import requests
import json
import os
import datetime
import time

def load_env_file():
    # Try parent directory .env (workspace root) and current directory .env
    dirs = [
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        os.path.dirname(os.path.abspath(__file__))
    ]
    for d in dirs:
        env_path = os.path.join(d, ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        # Strip optional quotes
                        v = v.strip("'\"")
                        os.environ[k.strip()] = v

# Load environment variables from .env
load_env_file()

# Configurations
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "data.js")

# RapidAPI Key: reads from env variable RAPIDAPI_KEY, fallback to user's current key
RAPIDAPI_KEY = os.environ.get("RAPIDAPI_KEY", "ca3f32f8d2msh2837e1e472c671ap19ab72jsnc2437284c988")

def find_count_recursive(data, target_keys):
    """Recursively search for a count value matching target keys in nested data structures."""
    if isinstance(data, dict):
        # First check direct keys at this level
        for k in target_keys:
            if k in data:
                val = data[k]
                if isinstance(val, (int, float)):
                    return int(val)
                elif isinstance(val, str):
                    try:
                        return int(float(val))
                    except ValueError:
                        pass
                elif isinstance(val, dict) and "count" in val:
                    c = val["count"]
                    if isinstance(c, (int, float)):
                        return int(c)
        # Otherwise descend into sub-structures
        for v in data.values():
            res = find_count_recursive(v, target_keys)
            if res is not None:
                return res
    elif isinstance(data, list):
        for item in data:
            res = find_count_recursive(item, target_keys)
            if res is not None:
                return res
    return None

def get_instagram_followers():
    print("Fetching Instagram followers via RapidAPI...")
    url = "https://instagram-looter2.p.rapidapi.com/profile"
    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "instagram-looter2.p.rapidapi.com"
    }
    params = {"username": "quadratin.morelos"}
    try:
        r = requests.get(url, headers=headers, params=params, timeout=15)
        if r.status_code == 200:
            data = r.json()
            count = None
            if isinstance(data, dict):
                # Try standard graphql paths
                count = (data.get("edge_followed_by", {}).get("count") or
                         data.get("user", {}).get("edge_followed_by", {}).get("count") or
                         data.get("graphql", {}).get("user", {}).get("edge_followed_by", {}).get("count"))
            if count is None:
                # Recursive fallback
                count = find_count_recursive(data, ["edge_followed_by", "follower_count", "followers"])
            
            if count is not None:
                print(f"Instagram followers: {count}")
                return count
            else:
                print(f"Instagram: Could not find follower count in JSON: {str(data)[:300]}")
        else:
            print(f"Instagram API Error {r.status_code}: {r.text}")
    except Exception as e:
        print(f"Instagram API Exception: {e}")
    return None

def get_tiktok_followers():
    print("Fetching TikTok followers via RapidAPI...")
    url = "https://tiktok-scraper7.p.rapidapi.com/user/info"
    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "tiktok-scraper7.p.rapidapi.com"
    }
    params = {"unique_id": "quadratinmorelos"}
    try:
        r = requests.get(url, headers=headers, params=params, timeout=15)
        if r.status_code == 200:
            data = r.json()
            count = None
            if isinstance(data, dict):
                d = data.get("data", {})
                if isinstance(d, dict):
                    # Try stats key
                    count = d.get("stats", {}).get("followerCount") or d.get("user", {}).get("stats", {}).get("followerCount")
            if count is None:
                count = find_count_recursive(data, ["followerCount", "follower_count", "followers"])
            
            if count is not None:
                print(f"TikTok followers: {count}")
                return count
            else:
                print(f"TikTok: Could not find follower count in JSON: {str(data)[:300]}")
        else:
            print(f"TikTok API Error {r.status_code}: {r.text}")
    except Exception as e:
        print(f"TikTok API Exception: {e}")
    return None

def get_facebook_followers():
    # Facebook has a limit of 25/month. Skip on weekends.
    is_weekend = datetime.datetime.today().weekday() in (5, 6)
    if is_weekend:
        print("Facebook API call skipped (weekend limit preservation)")
        return None

    print("Fetching Facebook followers via RapidAPI...")
    url = "https://facebook-pages-scraper2.p.rapidapi.com/get_facebook_pages_details"
    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "facebook-pages-scraper2.p.rapidapi.com"
    }
    params = {
        "link": "https://www.facebook.com/QuadratinMorelos",
        "show_verified_badge": "false",
        "proxy_country": "us"
    }
    try:
        r = requests.get(url, headers=headers, params=params, timeout=15)
        if r.status_code == 200:
            data = r.json()
            count = None
            if isinstance(data, list) and len(data) > 0:
                data = data[0]
            if isinstance(data, dict):
                d = data.get("data", {}) if "data" in data else data
                if isinstance(d, dict):
                    count = d.get("followers") or d.get("followers_count") or d.get("likes") or d.get("likes_count")
            if count is None:
                count = find_count_recursive(data, ["followers", "followers_count", "likes", "likes_count"])
            
            if count is not None:
                print(f"Facebook followers: {count}")
                return count
            else:
                print(f"Facebook: Could not find follower/like count in JSON: {str(data)[:300]}")
        else:
            print(f"Facebook API Error {r.status_code}: {r.text}")
    except Exception as e:
        print(f"Facebook API Exception: {e}")
    return None

def get_twitter_followers():
    print("Fetching Twitter/X followers via RapidAPI...")
    url = "https://twitter-api45.p.rapidapi.com/screenname.php"
    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "twitter-api45.p.rapidapi.com"
    }
    params = {"screenname": "Quadratin_Mor"}
    try:
        r = requests.get(url, headers=headers, params=params, timeout=15)
        if r.status_code == 200:
            data = r.json()
            count = None
            if isinstance(data, dict):
                count = data.get("followers_count") or data.get("sub_count") or data.get("followers")
            if count is None:
                count = find_count_recursive(data, ["followers_count", "sub_count", "followers"])
            
            if count is not None:
                print(f"Twitter/X followers: {count}")
                return count
            else:
                print(f"Twitter/X: Could not find follower count in JSON: {str(data)[:300]}")
        else:
            print(f"Twitter/X API Error {r.status_code}: {r.text}")
    except Exception as e:
        print(f"Twitter/X API Exception: {e}")
    return None

def main():
    print(f"=== SOCIAL MEDIA UPDATER - {datetime.datetime.now()} ===")
    
    # Load existing data from src/data.js
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            content = f.read()
            # Strip "export const qm_data = " and trailing semicolon
            json_str = content.replace("export const qm_data = ", "").strip()
            if json_str.endswith(";"):
                json_str = json_str[:-1]
            data = json.loads(json_str)
    else:
        # Fallback structure
        data = {
            "history": [],
            "goals": {
                "instagram": 13500,
                "tiktok": 7500,
                "facebook": 84000,
                "twitter": 15200
            }
        }
    
    # Fetch current metrics
    instagram = get_instagram_followers()
    tiktok = get_tiktok_followers()
    facebook = get_facebook_followers()
    twitter = get_twitter_followers()
    
    # Check if we got at least one metric to update
    if not any([instagram, tiktok, facebook, twitter]):
        print("Error: Could not retrieve any metrics. Aborting update.")
        return

    # Use existing last value if a scrape failed to avoid losing data
    today_str = datetime.date.today().isoformat()
    
    # Retrieve last known values as fallback
    last_entry = data["history"][-1] if data["history"] else {}
    
    new_entry = {
        "date": today_str,
        "instagram": instagram if instagram is not None else last_entry.get("instagram", 0),
        "tiktok": tiktok if tiktok is not None else last_entry.get("tiktok", 0),
        "facebook": facebook if facebook is not None else last_entry.get("facebook", 0),
        "twitter": twitter if twitter is not None else last_entry.get("twitter", 0)
    }
    
    # If scraping failed for a platform, flag it so frontend knows
    failed_platforms = []
    if instagram is None: failed_platforms.append("instagram")
    if tiktok is None: failed_platforms.append("tiktok")
    # Facebook is only "failed" if it's not a weekend and returned None
    is_weekend = datetime.datetime.today().weekday() in (5, 6)
    if facebook is None and not is_weekend: failed_platforms.append("facebook")
    if twitter is None: failed_platforms.append("twitter")
    
    if failed_platforms:
        new_entry["failed_scrapes"] = failed_platforms
        print(f"Warnings: Failed to scrape: {failed_platforms}")

    # Check if there is already an entry for today
    today_index = -1
    for idx, entry in enumerate(data["history"]):
        if entry["date"] == today_str:
            today_index = idx
            break
            
    if today_index != -1:
        # Update today's entry
        # If a scrape failed today but we had succeeded earlier today, preserve the previous value
        prev_today = data["history"][today_index]
        for key in ["instagram", "tiktok", "facebook", "twitter"]:
            # If new is 0 or fallback, but previous was non-zero, keep previous
            if new_entry[key] == 0 or key in failed_platforms:
                if prev_today.get(key, 0) > 0:
                    new_entry[key] = prev_today[key]
        
        # Merge failed scrapes flags
        prev_failed = prev_today.get("failed_scrapes", [])
        new_failed = list(set(failed_platforms) & set(prev_failed)) # only keep if both failed
        if new_failed:
            new_entry["failed_scrapes"] = new_failed
        elif "failed_scrapes" in new_entry:
            del new_entry["failed_scrapes"]
            
        data["history"][today_index] = new_entry
        print("Updated existing entry for today.")
    else:
        # Append new entry
        data["history"].append(new_entry)
        print("Added new entry for today.")
        
    # Save back to src/data.js
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        f.write("export const qm_data = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n")
        
    print("src/data.js updated successfully!")

    # Generate dynamic Claude AI analysis
    generate_ai_analysis(data["history"], data["goals"])

def generate_ai_analysis(history, goals):
    print("Generating AI analysis via Claude...")
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY")
    if not anthropic_key:
        print("ANTHROPIC_API_KEY not found. Skipping AI analysis.")
        return

    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": anthropic_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    
    prompt = f"""
    Eres un analista de redes sociales experto para la agencia de noticias Quadratín Morelos.
    Analiza el historial de métricas reciente de seguidores y los objetivos (goals) de la campaña para generar un resumen de avances dinámico (Logros, Accionables y Dependencias).

    Historial de métricas (últimas entradas):
    {json.dumps(history[-3:], indent=2)}

    Objetivos de seguidores a alcanzar:
    {json.dumps(goals, indent=2)}

    Por favor, genera un análisis dinámico en español profesional. Devuelve exclusivamente un objeto JSON válido (sin explicaciones, sin bloques de código Markdown como ```json, solo el JSON puro) con la siguiente estructura:
    {{
      "redes": {{
        "title": "Avance Operativo - Redes Sociales (Análisis de IA)",
        "is_dynamic": true,
        "logros": [
          "logro 1 (analiza el crecimiento de seguidores y qué metas se están logrando, menciona números concretos de crecimiento si es posible)",
          "logro 2",
          "logro 3"
        ],
        "accionables": [
          "accionable 1 (tareas o enfoques para la próxima semana basados en el rendimiento)",
          "accionable 2",
          "accionable 3"
        ],
        "dependencias": [
          "dependencia 1 (notas sobre el avance general, dependencias operativas o advertencias sobre metas lejanas)",
          "dependencia 2"
        ]
      }}
    }}
    """

    payload = {
        "model": "claude-sonnet-4-6",
        "max_tokens": 1500,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    try:
        r = requests.post(url, headers=headers, json=payload, timeout=30)
        if r.status_code == 200:
            res_data = r.json()
            content = res_data.get("content", [])[0].get("text", "").strip()
            
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

            analysis_json = json.loads(content)
            
            analysis_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "analysis.js")
            
            radar_default = {
                "title": "Avance Operativo - Radar Analytics",
                "logros": [
                    "Se llevó a cabo la reunión con el equipo de Laboratorio para discutir la metodología, las metas y el flujo de trabajo necesario."
                ],
                "accionables": [
                    "El equipo de Laboratorio se comprometió a enviar un resumen de las herramientas funcionales para automatización.",
                    "Se tocará base de los avances el miércoles 6 de mayo (se requiere reagendar)."
                ],
                "dependencias": [
                    "Definir si será necesario adquirir la clasificación de medios por Tier 1."
                ]
            }
            
            full_analysis = {
                "redes": analysis_json.get("redes", {}),
                "radar": radar_default
            }
            
            with open(analysis_file, "w", encoding="utf-8") as f:
                f.write("export const qm_analysis = " + json.dumps(full_analysis, indent=2, ensure_ascii=False) + ";\n")
            print("AI analysis generated and src/analysis.js updated successfully!")
        else:
            print(f"Claude API Error {r.status_code}: {r.text}")
    except Exception as e:
        print(f"Claude API Exception: {e}")

if __name__ == "__main__":
    main()
