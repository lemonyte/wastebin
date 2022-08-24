# TODO
# fix footer - in progress
# documents save options - in progress
# switch from w3.css to bulma
# about page

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

from document import Document
from database import DetaDB

load_dotenv()
app = FastAPI()
app.mount('/static', StaticFiles(directory='static'), name='static')
templates = Jinja2Templates(directory='templates')
db = DetaDB('documents')


@app.get('/', response_class=HTMLResponse)
async def new(request: Request):
    return templates.TemplateResponse('new.html', {'request': request})


@app.get('/{id}', response_class=HTMLResponse)
async def view(id: str, request: Request):
    document = db.get(id)
    if document:
        return templates.TemplateResponse('view.html', {'request': request, 'doc': document})
    else:
        raise HTTPException(status_code=404)


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
    if document:
        return document
    else:
        raise HTTPException(status_code=404)


@app.exception_handler(404)
async def not_found_handler(request: Request, exception):
    return templates.TemplateResponse('404.html', {'request': request})
