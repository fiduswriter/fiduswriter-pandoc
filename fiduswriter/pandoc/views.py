from httpx import AsyncClient
from urllib.parse import urljoin
from asgiref.sync import async_to_sync, sync_to_async

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.http import HttpResponse

PANDOC_URL = "http://localhost:3030/"
if hasattr(settings, "PANDOC_URL"):
    PANDOC_URL = settings.PANDOC_URL


@sync_to_async
@login_required
@require_POST
@async_to_sync
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
        status=response.status_code
    )
