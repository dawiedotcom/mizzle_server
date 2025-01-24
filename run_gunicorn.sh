#!/bin/bash

. app_env

export FLASK_APP=mizzle_server
export SCRIPT_NAME=/dev/weatherstation

gunicorn --log-level debug --bind 0.0.0.0:55407 mizzle_server.wsgi:app

