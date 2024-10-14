from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import predict
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

origins = [
    os.getenv("ORIGIN_URL")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api")
