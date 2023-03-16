from setuptools import setup, find_packages

name = 'Mizzle'
version = '0.0'
release = '0.0.1'
author = 'David de Klerk'

setup(
    name=name,
    packages=find_packages(),
    version=release,
    include_package_data=True,
    install_requires=[
        "sqlalchemy",
        "flask>=1.0",
        "flask_sqlalchemy",
        "Flask-FlatPages",
        "psycopg2",
    ],
    package_data={
        'CRESHMap': [
            'templates/*.html', 
            'static/map.js',
            'static/images/*',
        ]},
    extras_require={
        'lint': [
            'flake8>=3.5.0',
        ],
    },
    #entry_points={
    #    'console_scripts': [
    #    ],
    #},
    author=author,
    description=("Mizzle web application to display weather data"),
)
