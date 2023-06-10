# TODO
# passwords for documents
# custom ids
# folders/multiple files
# readme

import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from database import DetaDB
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
    document = await api_get(id)
    return templates.TemplateResponse("view.html", {"request": request, "document": document})


@app.get("/raw/{id:path}", response_class=PlainTextResponse)
async def raw(id: str):
    document = await api_get(id)
    return document.content


@app.post("/api/new", response_model=Document)
async def api_new(document: Document):
    try:
        db.put(document)
        return document
    except Exception as exc:
        raise HTTPException(409) from exc


@app.get("/api/get/{id:path}", response_model=Document)
async def api_get(id: str):
    document = db.get(os.path.splitext(id)[0])
    if document is None:
        if os.path.isfile(id):
            with open(id, "r") as file:
                return Document(
                    content=file.read(),
                    id=id,
                    filename=id,
                )
        raise HTTPException(404)
    if document.ephemeral:
        db.delete(id)
    return document


@app.exception_handler(404)
async def not_found_handler(request: Request, _):
    with open(__file__, "r") as file:
        text = file.read()
    code = text[text.find("@app.exception_handler(404)"):]
    return templates.TemplateResponse("404.html", {"request": request, "code": code}, 404)
