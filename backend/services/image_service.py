"""
Image generation service using OpenAI DALL·E 3.
Generates warehouse/fleet visuals and caches them on disk.
"""
import os
import hashlib
import httpx
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

STATIC_DIR = Path(__file__).resolve().parent.parent / "static" / "images"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

api_key = os.getenv("OPENAI_API_KEY")
client = None
if api_key and api_key != "your_openai_api_key_goes_here":
    client = OpenAI(api_key=api_key)


def _safe_filename(name: str) -> str:
    return hashlib.md5(name.encode()).hexdigest()


async def generate_warehouse_image(name: str, city: str) -> str | None:
    """
    Generate a warehouse image via DALL·E 3 and cache it.
    Returns the relative URL path (e.g. /static/images/abc123.png) or None on failure.
    """
    slug = _safe_filename(f"warehouse_{name}_{city}")
    cached = STATIC_DIR / f"{slug}.png"
    if cached.exists():
        return f"/static/images/{slug}.png"

    if not client:
        return None

    prompt = (
        f"A modern, futuristic logistics warehouse named '{name}' in {city}, India. "
        "Aerial isometric view, dark blue and cyan color scheme, glowing LED lights, "
        "cargo containers, loading docks, trucks parked outside. "
        "Clean digital illustration style, high detail, no text or labels."
    )

    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url

        # Download and cache the image
        async with httpx.AsyncClient() as http:
            img_resp = await http.get(image_url, timeout=30)
            if img_resp.status_code == 200:
                cached.write_bytes(img_resp.content)
                return f"/static/images/{slug}.png"
    except Exception as e:
        print(f"[ImageService] DALL·E error: {e}")

    return None


async def generate_vehicle_image(vehicle_type: str) -> str | None:
    """
    Generate a vehicle image. Uses cached images per vehicle type.
    """
    slug = _safe_filename(f"vehicle_{vehicle_type}")
    cached = STATIC_DIR / f"{slug}.png"
    if cached.exists():
        return f"/static/images/{slug}.png"

    if not client:
        return None

    prompt = (
        f"A futuristic logistics {vehicle_type} vehicle on an Indian highway. "
        "Dark blue and cyan color scheme, neon accent lights, "
        "clean digital illustration style, side profile view, high detail, no text."
    )

    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url

        async with httpx.AsyncClient() as http:
            img_resp = await http.get(image_url, timeout=30)
            if img_resp.status_code == 200:
                cached.write_bytes(img_resp.content)
                return f"/static/images/{slug}.png"
    except Exception as e:
        print(f"[ImageService] DALL·E error: {e}")

    return None
