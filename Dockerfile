# ---------- stage 1: build frontend ----------
FROM node:18-alpine AS node_builder
WORKDIR /app

# copy only package files first to leverage caching
COPY package*.json ./
# if using yarn: COPY yarn.lock ./
RUN npm ci

# copy rest and build
COPY . .
RUN npm run build

# ---------- stage 2: Python runtime ----------
FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app

# install system dependencies required for dlib/face-recognition + pillow/numpy build wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    pkg-config \
    libatlas-base-dev \
    libopenblas-dev \
    liblapack-dev \
    libjpeg-dev \
    libpng-dev \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# copy the frontend build output from node stage
COPY --from=node_builder /app/build ./build

# copy python requirements and install
COPY requirements.txt .
RUN python -m pip install --upgrade pip
# Prefer wheels if available; installing from requirements will compile if necessary
RUN pip install -r requirements.txt

# copy the rest of the project
COPY . .

ENV PORT=5000

EXPOSE 5000

# production server
CMD ["gunicorn", "app:app", "-b", "0.0.0.0:5000", "--workers", "4"]
