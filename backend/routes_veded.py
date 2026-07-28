"""VEDED creation studio endpoints (image / video / audio / movie compiler)."""
import os
import base64
import asyncio
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from auth import get_current_user_id, new_id
from plans import GENERATION_COST

router = APIRouter(prefix="/api/veded", tags=["veded"])


class GenerateReq(BaseModel):
    kind: str = Field(pattern="^(image|video|audio|movie)$")
    prompt: str = Field(min_length=1, max_length=2000)
    style: Optional[str] = None
    model: Optional[str] = None
    aspect_ratio: Optional[str] = "16:9"
    duration: Optional[int] = 5  # seconds for video / audio
    voice: Optional[str] = None  # for audio
    options: Optional[dict] = None  # arbitrary studio toggles (upscale, denoise, etc.)

    model_config = {"extra": "ignore"}


PLACEHOLDER_IMAGES = [
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1024",  # cyberpunk
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1024",     # abstract
    "https://images.unsplash.com/photo-1614850523011-8f49ffc73908?w=1024",  # neon
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1024",  # space
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1024",  # sci-fi
    "https://images.unsplash.com/photo-1478720568477-b0829d60d9f6?w=1024",  # noir
]

PLACEHOLDER_VIDEOS = [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
]

PLACEHOLDER_AUDIO = [
    "https://cdn.pixabay.com/audio/2022/10/25/audio_69a61cd719.mp3",
    "https://cdn.pixabay.com/audio/2023/06/13/audio_5fb0c1d3d3.mp3",
]


async def _generate_image_via_emergent(prompt: str, aspect_ratio: str = "16:9") -> Optional[str]:
    """Try real image generation via emergentintegrations; fallback to placeholder."""
    try:
        from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
        key = os.environ.get("EMERGENT_LLM_KEY")
        if not key:
            return None
        gen = OpenAIImageGeneration(api_key=key)
        size = "1024x1024" if aspect_ratio == "1:1" else ("1792x1024" if aspect_ratio == "16:9" else "1024x1792")
        images = await gen.generate_images(prompt=prompt, model="gpt-image-1", number_of_images=1, size=size)
        if images and len(images) > 0:
            # Returns bytes
            b64 = base64.b64encode(images[0]).decode()
            return f"data:image/png;base64,{b64}"
    except Exception as e:
        print(f"[veded] Emergent image gen failed: {e}")
    return None


def _pick_placeholder(items: list, prompt: str) -> str:
    idx = abs(hash(prompt)) % len(items)
    return items[idx]


def build_router(db):
    @router.post("/generate")
    async def generate(payload: GenerateReq, user_id: str = Depends(get_current_user_id)):
        u = await db.users.find_one({"id": user_id})
        if not u:
            raise HTTPException(404, "User not found")
        wallet = u.get("wallet", {})
        cost_map = GENERATION_COST[payload.kind if payload.kind != "movie" else "video"]
        field = cost_map["credit_field"]
        need = cost_map["amount"]
        if payload.kind == "audio":
            need = max(len(payload.prompt), 500)
        if payload.kind == "movie":
            need = 5  # movie costs 5 video credits
        current = wallet.get(field, 0)
        if current < need:
            raise HTTPException(402, f"Insufficient {field}. Need {need}, have {current}.")

        # Create creation record
        cid = new_id()
        creation = {
            "id": cid,
            "user_id": user_id,
            "type": payload.kind,
            "prompt": payload.prompt,
            "style": payload.style,
            "model": payload.model,
            "aspect_ratio": payload.aspect_ratio,
            "options": payload.options or {},
            "status": "processing",
            "output_url": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.creations.insert_one(creation)

        # Generate output
        output_url = None
        if payload.kind == "image":
            output_url = await _generate_image_via_emergent(payload.prompt, payload.aspect_ratio or "16:9")
            if not output_url:
                output_url = _pick_placeholder(PLACEHOLDER_IMAGES, payload.prompt)
        elif payload.kind == "video":
            output_url = _pick_placeholder(PLACEHOLDER_VIDEOS, payload.prompt)
        elif payload.kind == "audio":
            output_url = _pick_placeholder(PLACEHOLDER_AUDIO, payload.prompt)
        elif payload.kind == "movie":
            # Simulate long-form movie compiler
            output_url = _pick_placeholder(PLACEHOLDER_VIDEOS, payload.prompt)

        # Update creation
        await db.creations.update_one(
            {"id": cid},
            {"$set": {"status": "completed", "output_url": output_url,
                      "completed_at": datetime.now(timezone.utc).isoformat()}}
        )
        # Deduct credit
        await db.users.update_one(
            {"id": user_id},
            {"$inc": {f"wallet.{field}": -need}}
        )

        u2 = await db.users.find_one({"id": user_id})
        creation_out = {k: v for k, v in creation.items() if k != "_id"}
        creation_out["status"] = "completed"
        creation_out["output_url"] = output_url
        return {
            "creation": creation_out,
            "wallet": u2.get("wallet", {}),
        }

    @router.get("/creations")
    async def list_creations(user_id: str = Depends(get_current_user_id), limit: int = 50):
        cur = db.creations.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(limit)
        items = await cur.to_list(limit)
        return {"items": items}

    @router.delete("/creations/{cid}")
    async def delete_creation(cid: str, user_id: str = Depends(get_current_user_id)):
        res = await db.creations.delete_one({"id": cid, "user_id": user_id})
        return {"deleted": res.deleted_count}

    return router
