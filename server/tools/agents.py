from openai import OpenAI

from database.database import db
from helper import encoder

async def agent(prompt: str, name: str, temp: float, input: str, reasoning: bool) -> object:
    agents_info = await db.Agents.find_one(
    {"name": name}
    )

    BASE_URL = agents_info.get("endpoint")
    API_KEY = encoder.decrypt_value(agents_info.get("api_key"))
    if name == "OpenAI GPT-oss-120b":
        name = "default"

    try:
        client = OpenAI(
        base_url = f"{BASE_URL}",
        api_key = f"{API_KEY}"
        )

    except:
        return {"status":"error","message": "Incorrect credentianls"}
    
    prompt = prompt + "\n" + input
    completion = client.chat.completions.create(
    model=f"{name}",
    messages=[{"role":"user","content":f"{prompt}"}],
    temperature=temp,
    top_p=0.95,
    max_tokens=16384,
    extra_body={"chat_template_kwargs":{"enable_thinking":reasoning},"reasoning_budget":16384},
    stream=True
    )
    content = ""
    for chunk in completion:
        if not chunk.choices:
            continue
        reasoning = getattr(chunk.choices[0].delta, "reasoning_content", None)
        if reasoning:
            r = reasoning + "\n"
            content += r
            r = ""
        if chunk.choices[0].delta.content is not None:
            info = chunk.choices[0].delta.content + "\n"
            content += info
    return {"status":"success",
            "content": f"{content}"}
