from openai import OpenAI
from app.config import settings

client = OpenAI(
    api_key=settings.openrouter_api_key,
    base_url=settings.openrouter_base_url,
)

SYSTEM_PROMPT = """You are VoyageLink AI, an expert supply chain assistant.
You help supply chain managers with logistics questions, shipment analysis,
inventory optimization, and demand forecasting. Be concise and actionable.
When given data, analyze it and provide specific, numbered recommendations.
Always focus on reducing risk, cutting costs, and improving delivery performance."""


def chat_completion(messages: list[dict]) -> str:
    full_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages
    response = client.chat.completions.create(
        model=settings.openrouter_model,
        messages=full_messages,
        temperature=0.7,
        max_tokens=1024,
    )
    return response.choices[0].message.content
