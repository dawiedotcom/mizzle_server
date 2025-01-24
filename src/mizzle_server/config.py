import os

class Config:
    STATIC_FOLDER = 'static'
    TEMPLATES_FOLDER = 'templates'
    DATABASE_URI = os.environ.get('DATABASE_URL')
