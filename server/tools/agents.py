from config import config
from openai import OpenAI

def agent(prompt: str, name: str, temp: float, input: str, reasoning: bool) -> object:
    BASE_URL = config.AGENT_BASEURL
    API_KEY = config.AGENT_KEY
    MODLE_LIST = config.AGENT_MODEL

    try:
        client = OpenAI(
        base_url = f"{BASE_URL}",
        api_key = f"{API_KEY}"
        )

    except:
        return {"status":"error","message": "Incorrect credentianls"}

    if not name in MODLE_LIST:
        return {"status":"error","message": "Model Not Found"}
    
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
