from __future__ import annotations

import base64
import io
import json
import os
from typing import List, Literal, Dict, Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PIL import Image
import torch
from transformers import (
  AutoImageProcessor,
  SiglipForImageClassification,
  AutoModelForCausalLM,
  AutoTokenizer,
)


MODEL_NAME = "prithivMLmods/tooth-agenesis-siglip2"
LLM_MODEL_NAME = os.getenv("HF_LLM_MODEL", "meta-llama/Llama-3.1-8B-Instruct")

app = FastAPI(title="Dentiscan Python Backend")


class AnalyzeRequest(BaseModel):
  imageBase64: str


RiskLevel = Literal["low", "medium", "high"]


class AiFinding(BaseModel):
  title: str
  confidence: float
  note: str


class AiAnamnesisField(BaseModel):
  value: str | None
  questions: List[str]


class AiAnamnesis(BaseModel):
  pain: AiAnamnesisField
  bleeding: AiAnamnesisField
  duration: AiAnamnesisField
  medical: AiAnamnesisField


class AiResult(BaseModel):
  summary: str
  riskLevel: RiskLevel
  findings: List[AiFinding]
  recommendations: List[str]
  anamnesis: AiAnamnesis
  disclaimer: str


class InterpretRequest(BaseModel):
  result: AiResult


class InterpretResponse(BaseModel):
  interpretation: str


id2label: Dict[int, str] = {
  0: "Calculus",
  1: "Caries",
  2: "Gingivitis",
  3: "Mouth Ulcer",
  4: "Tooth Discoloration",
  5: "hypodontia",
}


@app.on_event("startup")
async def load_model() -> None:
  global processor, model, llm_tokenizer, llm_model
  processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
  model = SiglipForImageClassification.from_pretrained(MODEL_NAME)
  model.eval()

  # LLM (Meta Llama 3.1 8B Instruct via Hugging Face)
  # Hugging Face erişim anahtarını HUGGINGFACEHUB_API_TOKEN veya HF_TOKEN ile vermen gerekiyor.
  llm_tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_NAME)
  llm_model = AutoModelForCausalLM.from_pretrained(
    LLM_MODEL_NAME,
    torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
    device_map="auto" if torch.cuda.is_available() else None,
  )
  llm_model.eval()


@app.get("/health")
async def health() -> Dict[str, Any]:
  return {"ok": True, "model": MODEL_NAME}


@app.post("/analyze", response_model=AiResult)
async def analyze(req: AnalyzeRequest) -> AiResult:
  try:
    image_bytes = base64.b64decode(req.imageBase64)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
  except Exception as exc:  # noqa: BLE001
    raise HTTPException(status_code=400, detail="Invalid base64 image") from exc

  inputs = processor(images=image, return_tensors="pt")

  with torch.no_grad():
    outputs = model(**inputs)
    logits = outputs.logits
    probs = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()

  scored_labels = [
    {"label": id2label.get(i, str(i)), "score": float(probs[i])}
    for i in range(len(probs))
  ]
  scored_labels.sort(key=lambda x: x["score"], reverse=True)

  top = scored_labels[0]
  score = top["score"]

  if score > 0.75:
    risk_level: RiskLevel = "high"
  elif score > 0.5:
    risk_level = "medium"
  else:
    risk_level = "low"

  findings = [
    AiFinding(
      title=item["label"],
      confidence=item["score"],
      note=(
        "Bu bulgu, tooth-agenesis-siglip2 diş görüntü sınıflandırma modelinin çıktısıdır. "
        "Diş hekimi muayenesinin yerini tutmaz."
      ),
    )
    for item in scored_labels
  ]

  anamnesis = AiAnamnesis(
    pain=AiAnamnesisField(
      value=None,
      questions=["Ağrı var mı?", "Sıcak/soğuk hassasiyeti hissediyor musunuz?"],
    ),
    bleeding=AiAnamnesisField(
      value=None,
      questions=["Diş eti kanaması oluyor mu?", "Fırçalama sırasında kanama fark ediyor musunuz?"],
    ),
    duration=AiAnamnesisField(
      value=None,
      questions=["Şikayet ne zamandır var?", "Son haftalarda artış fark ettiniz mi?"],
    ),
    medical=AiAnamnesisField(
      value=None,
      questions=["Düzenli ilaç kullanımı var mı?", "Bilinen kronik hastalıklarınız var mı?"],
    ),
  )

  result = AiResult(
    summary=f"Model çıktısı: {top['label']} (güven skoru: {score * 100:.1f}%).",
    riskLevel=risk_level,
    findings=findings,
    recommendations=[
      "Düzenli diş fırçalama ve diş ipi kullanımına devam edin.",
      "Şikayetiniz varsa bir diş hekimi randevusu planlayın.",
    ],
    anamnesis=anamnesis,
    disclaimer=(
      "Bu sonuç tıbbi tanı değildir; tooth-agenesis-siglip2 modeliyle elde edilmiştir. "
      "Kesin değerlendirme için diş hekimi muayenesi gerekir."
    ),
  )

  return result


@app.post("/interpret", response_model=InterpretResponse)
async def interpret(req: InterpretRequest) -> InterpretResponse:
  try:
    payload = req.result.model_dump()
    summary = payload.get("summary", "")
    risk = payload.get("riskLevel", "")
    findings = payload.get("findings", [])

    system_prompt = (
      "Sen deneyimli bir diş hekimi gibi konuşan bir asistansın. "
      "Kullanıcıya kısa, sade ve anlaşılır TÜRKÇE cümlelerle analiz sonucunu açıklarsın. "
      "Tıbbi tanı koymazsın, kesin tanı için mutlaka diş hekimi muayenesi gerektiğini hatırlatırsın."
    )

    user_prompt = (
      "Aşağıda tooth-agenesis-siglip2 modelinden gelen diş analizi sonucu var.\n\n"
      f"Özet: {summary}\n"
      f"Risk seviyesi: {risk}\n"
      f"Bulgular: {json.dumps(findings, ensure_ascii=False)}\n\n"
      "1-2 paragrafta, kullanıcıya durumu açıkla, hangi bulguların öne çıktığını belirt ve "
      "ne zaman diş hekimine gitmesi gerektiği konusunda genel tavsiyeler ver. "
      "Madde işareti kullanma, düz metin yaz."
    )

    messages = [
      {"role": "system", "content": system_prompt},
      {"role": "user", "content": user_prompt},
    ]

    inputs = llm_tokenizer.apply_chat_template(
      messages,
      add_generation_prompt=True,
      return_tensors="pt",
    )

    if torch.cuda.is_available():
      inputs = inputs.to(llm_model.device)

    with torch.no_grad():
      outputs = llm_model.generate(
        inputs,
        max_new_tokens=350,
        do_sample=True,
        temperature=0.4,
      )

    generated = outputs[0][inputs.shape[-1] :]
    text = llm_tokenizer.decode(generated, skip_special_tokens=True).strip()
    return InterpretResponse(interpretation=text)
  except Exception as exc:  # noqa: BLE001
    raise HTTPException(status_code=500, detail=str(exc)) from exc



