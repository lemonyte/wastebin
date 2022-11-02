# TODO
# passwords for documents
# custom ids
# folders/multiple files
# about page

import os

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from database import DetaDB
from document import Document

app = FastAPI()
app.mount('/static', StaticFiles(directory='static'), name='static')
templates = Jinja2Templates(directory='templates')
db = DetaDB('documents')


@app.get('/', response_class=HTMLResponse)
async def new(request: Request):
    return templates.TemplateResponse('new.html', {'request': request})


@app.get('/about', response_class=HTMLResponse)
async def about(request: Request):
    return templates.TemplateResponse('about.html', {'request': request})


@app.post('/api/new', response_model=Document)
async def api_new(document: Document):
    try:
        db.put(document)
        return document
    except Exception as e:
        raise HTTPException(409) from e


@app.get('/api/get/{id}', response_model=Document)
async def api_get(id: str):
    document = db.get(id)
    if document is None:
        if id in os.listdir():
            with open(id, 'r') as file:
                return Document(
                    content=file.read(),
                    id=id,
                    filename=id,
                )
        raise HTTPException(status_code=404)
    if document.ephemeral:
        db.delete(id)
    return document


@app.get('/raw/{id}', response_class=PlainTextResponse)
async def raw(id: str):
    document = await api_get(id)
    return document.content


@app.get('/{id}', response_class=HTMLResponse)
async def view(id: str, request: Request):
    document = await api_get(id)
    return templates.TemplateResponse('view.html', {'request': request, 'document': document})


@app.exception_handler(404)
async def not_found_handler(request: Request, exception):
    return templates.TemplateResponse('404.html', {'request': request})
