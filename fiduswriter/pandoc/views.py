from httpx import AsyncClient, HTTPError

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.http import JsonResponse, HttpResponse

PANDOC_URL = "http://localhost:3030/"
if hasattr(settings, "PANDOC_URL"):
    PANDOC_URL = settings.PANDOC_URL
    # Add backslash if missing
    if not PANDOC_URL.endswith("/"):
        PANDOC_URL += "/"


@login_required
@require_POST
async def export(request):
    data = request.body
    async with AsyncClient() as client:
        response = await client.post(
            PANDOC_URL,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            data=data,
            timeout=88,  # Firefox times out after 90 seconds, so we need to return before that.
        )
    return HttpResponse(
        response.content,
        headers={"Content-Type": "application/json"},
        status=response.status_code,
    )


@login_required
async def available(request):
    """Return whether pandoc service is available"""
    try:
        async with AsyncClient() as client:
            response = await client.get(f"{PANDOC_URL}version")
            if response.status_code == 200:
                return JsonResponse({"available": True})
            return JsonResponse({"available": False})
    except HTTPError:
        return JsonResponse({"available": False})
