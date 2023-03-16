from flask import current_app as app
from flask import render_template
from flask_flatpages import FlatPages

from .data import get_time_averaged

pages = FlatPages(app)
@app.route('/')
def index():
    return render_template("weather.html")

@app.route('/data/<time_bucket_hours>')
def data(time_bucket_hours):
    print(time_bucket_hours)
    try:
        int(time_bucket_hours)
    except ValueError:
        return '[]'

    return get_time_averaged(time_bucket_hours)

@app.route('/<path:path>')
def page(path):
    page = pages.get_or_404(path)
    return render_template("weather.html")
