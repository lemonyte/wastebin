# TODO
# fix footer
# fixed navbar position
# paste save options

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

from paste import Paste, DetaDB  # , FileDB

load_dotenv()
app = FastAPI()
app.mount('/static', StaticFiles(directory='static'), name='static')
templates = Jinja2Templates(directory='templates')
db = DetaDB('pastes')
# db = FileDB()


@app.get('/', response_class=HTMLResponse)
async def new(request: Request):
    return templates.TemplateResponse('new.html', {'request': request})


@app.get('/{key}', response_class=HTMLResponse)
async def view(key: str, request: Request):
    paste = db.get(key)
    if paste:
        return templates.TemplateResponse('view.html', {'request': request, 'paste': paste})
    else:
        raise HTTPException(status_code=404)


@app.post('/api/new', response_model=Paste)
async def api_new(paste: Paste):
    db.put(paste)
    return paste


@app.get('/api/get/{key}', response_model=Paste)
async def api_get(key: str):
    paste = db.get(key)
    if paste:
        return paste
    else:
        raise HTTPException(status_code=404)


@app.exception_handler(404)
async def not_found_handler(request: Request, exception):
    return templates.TemplateResponse('404.html', {'request': request})
