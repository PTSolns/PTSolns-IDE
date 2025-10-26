# Use a Node.js 20 image as the base
FROM node:20

# Install necessary build tools and libraries for native modules
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libxkbfile-dev \
    libsecret-1-dev \
    && rm -rf /var/lib/apt/lists/*

# Install a newer version of Go (e.g., 1.22.0)
RUN wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz && \
    rm go1.22.0.linux-amd64.tar.gz
ENV PATH="/usr/local/go/bin:${PATH}"

# Check Go version for debugging
RUN go version

# Set the working directory inside the container
WORKDIR /app

# Copy all application code first
# COPY . .

# RUN chmod +x run.sh

# # Install dependencies
# RUN yarn install &&\
#     yarn build &&\
#     yarn --cwd electron-app rebuild &&\
#     yarn --cwd electron-app build &&\
#     yarn --cwd electron-app package

ENTRYPOINT [ "bash", "-c", "rm -rf /app/* && cp -r /src/. /app && yarn install && yarn build && yarn --cwd electron-app rebuild && yarn --cwd electron-app build && yarn --cwd electron-app package && rm -rf /downloads/* && cp -r /app/electron-app/dist/* /downloads" ]
