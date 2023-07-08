import random
import string
import time
from typing import Optional

from pydantic import BaseModel, Field, FieldValidationInfo, field_validator


def generate_id(length: int = 8) -> str:
    return "".join(random.choices(string.ascii_lowercase, k=length))


class Document(BaseModel):
    content: str
    id: str = Field(default_factory=generate_id, min_length=1)
    filename: str = ""
    highlighting_language: str = ""
    date_created: int = Field(default_factory=lambda: int(time.time()))
    ephemeral: bool = False
    expire_in: Optional[int] = Field(default=None, exclude=True)
    expire_at: Optional[int] = Field(default=None, validate_default=True)

    @field_validator("expire_at")
    @classmethod
    def validate_expire_at(cls, value: Optional[int], info: FieldValidationInfo) -> Optional[int]:
        if value is None:
            expire_in = info.data.get("expire_in")
            date_created = info.data.get("date_created")
            if expire_in is not None and date_created is not None:
                value = date_created + expire_in
        return value
