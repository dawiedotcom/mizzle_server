# Mizzle-server

A simple web app to display data from the weather station mounted on
the roof of the James Clerk Maxwell Building (JCMB).

## Run

Create a shell script called `app-env`:
```bash
#!/bin/bash
export DATABASE_URL='postgresql://...'
```
Run with `uv`, which creates a virtual environment:
```bash
uv run ./run_gunicorn.sh
```
