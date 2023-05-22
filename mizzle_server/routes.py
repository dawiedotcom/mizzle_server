from collections import namedtuple
from flask import current_app as app
from flask import render_template, redirect, send_file
from flask_flatpages import FlatPages
import re
import io

from .data import get_time_averaged, make_csv

pages = FlatPages(app)

MenuItem = namedtuple('MenuItem', 'title path order')

def menu_items():
    menu = [
        #MenuItem('Weather', '/', 1),
        MenuItem('Download', '/download', 2),
    ]
    menu = sorted(menu, key=lambda item: item.order)
    return menu

@app.route('/')
def index():
    return render_template(
        "weather.html",
        navigation=menu_items()
    )

@app.route('/download')
def download():
    days = get_time_averaged(24)
    csv_files = [
        str(date).split(' ')[0] + '_minute_data.csv'
        for date in days['time'].tolist()
    ]
    csv_files = sorted(csv_files, reverse=True)
    return render_template(
        "download.html",
        navigation=menu_items(),
        csv_files=csv_files,
    )

@app.route('/download/<filename>')
def download_file(filename):
    print(filename)
    if not re.fullmatch('\d\d\d\d-\d\d-\d\d_minute_data.csv', filename):
        return redirect('/download')

    date = filename.split('_')[0]
    csv_content = make_csv(date)

    return send_file(
        io.BytesIO(csv_content),
        download_name=filename,
    )

@app.route('/data/<time_bucket_hours>')
def data(time_bucket_hours):
    print(time_bucket_hours)
    try:
        int(time_bucket_hours)
    except ValueError:
        return '[]'

    return get_time_averaged(time_bucket_hours).to_json(date_format='iso', orient='records')

@app.route('/<path:path>')
def page(path):
    page = pages.get_or_404(path)
    return render_template("weather.html")
