#!/bin/bash

. .venv/bin/activate
. app_env

export FLASK_APP=mizzle_server
#export SCRIPT_NAME=/dev/cresh

gunicorn --log-level debug --bind 0.0.0.0:55405 mizzle_server.wsgi:app

