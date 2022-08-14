import os
import time
import string
import random
from threading import Thread

from deta import Deta
from pydantic import BaseModel, validator
from pygments import lexers, formatters, util, highlight


def generate_key(length: int = 8) -> str:
    return ''.join(random.choices(string.ascii_lowercase, k=length))


class Paste(BaseModel):
    content: str
    filename: str = ''
    date_created: int = None
    expire_at: int = None
    expire_in: int = None
    key: str = None
    highlighted: str = None

    class Config:
        fields = {
            'expire_in': {'exclude': True},
        }

    @validator('date_created', always=True)
    def validate_date_created(cls, value: int) -> int:
        if value is None:
            return int(time.time())
        return value

    @validator('expire_at', always=True)
    def validate_expire_in(cls, value: int, values: dict) -> int:
        if value is None:
            if values.get('expire_in') is not None:
                return values.get('date_created') + values.get('expire_in')
        return value

    @validator('key', always=True)
    def validate_key(cls, value: str) -> str:
        if value is None:
            return generate_key()
        return value

    def highlight(self, lexer_name: str = None):
        if self.highlighted:
            return self.highlighted
        if lexer_name:
            lexer = lexers.get_lexer_by_name(lexer_name)
        else:
            try:
                lexer = lexers.get_lexer_for_filename(self.filename, self.content)
            except util.ClassNotFound:
                try:
                    lexer = lexers.guess_lexer(self.content)
                except util.ClassNotFound:
                    lexer = lexers.get_lexer_by_name('text')
        formatter = formatters.HtmlFormatter(linenos='table')
        self.highlighted = highlight(self.content, lexer, formatter)
        return self.highlighted


class PasteDB:
    def get(self, key: str) -> Paste:
        raise NotImplementedError

    def put(self, paste: Paste) -> str:
        raise NotImplementedError


class FileDB(PasteDB):
    def __init__(self, path: str = 'pastes', clean_interval: int = 60 * 60 * 24):
        self.path = path
        self._clean_interval = clean_interval
        if not os.path.exists(self.path):
            os.makedirs(self.path, exist_ok=True)
        self._clean_thread = Thread(target=self._clean_expired, daemon=True)
        self._clean_thread.start()

    def _clean_expired(self):
        while True:
            for name in os.listdir(self.path):
                path = os.path.join(self.path, name)
                if os.path.isfile(path):
                    paste = Paste.parse_file(path)
                    if paste.expire_at and paste.expire_at < int(time.time()):
                        os.remove(path)
            time.sleep(self._clean_interval)

    def get(self, key: str) -> Paste:
        try:
            return Paste.parse_file(f'{self.path}/{key}.json')
        except OSError:
            return None

    def put(self, paste: Paste) -> str:
        with open(f'{self.path}/{paste.key}.json', 'w') as file:
            file.write(paste.json())
        return paste.key


class DetaDB(PasteDB):
    def __init__(self, name: str, deta_key: str = None):
        deta_key = deta_key or os.getenv('DETA_PROJECT_KEY')
        self._deta = Deta(deta_key)
        self._db = self._deta.Base(name)

    def get(self, key: str) -> Paste:
        paste = self._db.get(key)
        if paste:
            return Paste.parse_obj(paste)

    def put(self, paste: Paste) -> str:
        paste.highlight()
        self._db.put(paste.dict(), expire_at=paste.expire_at)
        return paste.key
