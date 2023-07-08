import os
import time
from abc import ABC, abstractmethod
from threading import Thread

from deta import Deta

from document import Document


class DocumentNotFoundError(Exception):
    pass


class DocumentExistsError(Exception):
    pass


class DocumentDB(ABC):
    @abstractmethod
    def get(self, id: str) -> Document:
        pass

    @abstractmethod
    def put(self, document: Document) -> str:
        pass

    @abstractmethod
    def delete(self, id: str):
        pass


class FileDB(DocumentDB):
    def __init__(self, path: str = "./data/documents", clean_interval: int = 60 * 60 * 24):
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
                    with open(path, "r") as file:
                        document = Document.model_validate_json(file.read())
                    if document.expire_at and document.expire_at < int(time.time()):
                        os.remove(path)
            time.sleep(self._clean_interval)

    def get(self, id: str) -> Document:
        try:
            with open(f"{self.path}/{id}.json", "r") as file:
                return Document.model_validate_json(file.read())
        except OSError as exc:
            raise DocumentNotFoundError() from exc

    def put(self, document: Document) -> str:
        path = f"{self.path}/{document.id}.json"
        if os.path.exists(path):
            raise DocumentExistsError()
        with open(path, "w") as file:
            file.write(document.model_dump_json())
        return document.id

    def delete(self, id: str):
        path = f"{self.path}/{id}.json"
        if os.path.exists(path):
            os.remove(path)


class DetaDB(DocumentDB):
    def __init__(self, name: str):
        self._deta = Deta()
        self._db = self._deta.Base(name)

    def get(self, id: str) -> Document:
        document = self._db.get(id)
        if document is None:
            raise DocumentNotFoundError()
        return Document.model_validate(document)

    def put(self, document: Document) -> str:
        try:
            self._db.insert(document.model_dump(), key=document.id, expire_at=document.expire_at)  # type: ignore
            return document.id
        except Exception as exc:
            raise DocumentExistsError() from exc

    def delete(self, id: str):
        self._db.delete(id)
