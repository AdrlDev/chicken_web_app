#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Deployment for Chicken Frontend..."

# 1. Pull latest changes from Git
echo "📥 Pulling latest code..."
git pull origin main

# 2. Build the Docker image with Build Args
# We use --no-cache to ensure Next.js bakes in the NEW environment variables
echo "🏗️ Building Docker image (this may take a few minutes)..."
docker build --no-cache -t chicken-frontend-image \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.aedev.cloud \
  --build-arg NEXT_PUBLIC_API_URL=https://api.aedev.cloud \
  --build-arg NEXT_PUBLIC_WS_URL=wss://api.aedev.cloud \
  .

# 3. Stop and Remove old container if it exists
echo "🔄 Swapping containers..."
if [ "$(docker ps -aq -f name=chicken-web)" ]; then
    echo "Stopping existing chicken-web container..."
    docker stop chicken-web
    docker rm chicken-web
fi

# 4. Run the new container
echo "🏃 Starting new container on port 3001..."
docker run -d \
  --name chicken-web \
  -p 3001:3000 \
  --restart always \
  chicken-frontend-image

# 5. Cleanup old images
echo "🧹 Cleaning up dangling images..."
docker image prune -f

echo "✅ Deployment Complete! Visit https://chicken.aedev.cloud"
echo "💡 Tip: If you still see 'undefined' in the browser, perform a Hard Refresh (Ctrl+F5)."
