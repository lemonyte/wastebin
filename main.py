import os

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import HTMLResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from database import DetaDB, DocumentExistsError, DocumentNotFoundError
from document import Document

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")
db = DetaDB("documents")


@app.get("/", response_class=HTMLResponse)
async def new(request: Request):
    return templates.TemplateResponse("new.html", {"request": request})


@app.get("/doc/{id:path}", response_class=HTMLResponse)
async def view(id: str, request: Request):
    return templates.TemplateResponse("view.html", {"request": request, "id": id})


@app.get("/raw/{id:path}", response_class=PlainTextResponse)
async def raw(id: str):
    document = await api_get(id)
    return document.content


@app.post("/api/new", response_model=Document)
async def api_new(document: Document):
    try:
        db.put(document)
        return document
    except DocumentExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT) from exc


@app.get("/api/get/{id:path}", response_model=Document)
async def api_get(id: str):
    try:
        document = db.get(os.path.splitext(id)[0])
        if document.ephemeral:
            db.delete(id)
        return document
    except DocumentNotFoundError as exc:
        if os.path.isfile(id):
            try:
                with open(id, "r", encoding="utf-8") as file:
                    content = file.read()
            except UnicodeDecodeError:
                with open(id, "rb") as file:
                    content = repr(file.read())
            return Document(
                content=content,
                id=id,
                filename=id,
            )
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND) from exc


@app.get("/__space/actions")
async def space_actions():
    return {
        "actions": [
            {
                "name": "new",
                "title": "New paste",
                "path": "/api/new",
                "input": [
                    {
                        "name": "content",
                        "type": "string",
                    },
                    {
                        "name": "filename",
                        "type": "string",
                        "optional": True,
                    },
                    {
                        "name": "ephemeral",
                        "type": "boolean",
                    },
                    {
                        "name": "expire_in",
                        "type": "number",
                        "optional": True,
                    },
                    {
                        "name": "id",
                        "type": "string",
                        "optional": True,
                    },
                ],
            },
        ]
    }


@app.exception_handler(404)
async def not_found_handler(request: Request, _):
    with open(__file__, "r", encoding="utf-8") as file:
        text = file.read()
    code = text[text.find("@app.exception_handler(404)"):]
    return templates.TemplateResponse("404.html", {"request": request, "code": code}, 404)
