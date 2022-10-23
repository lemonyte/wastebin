import time
import string
import random
from typing import Optional

from pydantic import BaseModel, validator


def generate_id(length: int = 8) -> str:
    return ''.join(random.choices(string.ascii_lowercase, k=length))


class Document(BaseModel):
    content: str
    filename: str = ''
    ephemeral: bool = False
    expire_at: Optional[int] = None
    expire_in: Optional[int] = None
    date_created: Optional[int] = None
    id: Optional[str] = None

    class Config:
        fields = {
            'expire_in': {'exclude': True},
        }

    @validator('date_created', always=True)
    def validate_date_created(cls, value: int) -> int:
        if value is None:
            value = int(time.time())
        return value

    @validator('expire_at', always=True)
    def validate_expire_in(cls, value: int, values: dict) -> int:
        if value is None:
            expire_in = values.get('expire_in')
            date_created = values.get('date_created')
            if expire_in is not None and date_created is not None:
                value = date_created + expire_in
        return value

    @validator('id', always=True)
    def validate_id(cls, value: str) -> str:
        if value is None:
            value = generate_id()
        return value
