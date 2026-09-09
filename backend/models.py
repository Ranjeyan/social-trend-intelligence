from pydantic import BaseModel
from typing import Optional


class ContentItem(BaseModel):
    source: str
    content_id: str
    title: str
    description: str
    author: str
    published_at: str
    engagement: int
    url: str