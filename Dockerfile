FROM alpine:latest

ARG PB_VERSION=0.39.1

RUN apk add --no-cache \
    unzip \
    ca-certificates

# download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

EXPOSE 8080

# Kopyahin ang custom server code papasok sa /pb/pb_hooks
COPY pb_hooks /pb/pb_hooks

# START POCKETBASE (Tiyak na itinuturo ang tamang folder ng database at hooks!)
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080", "--dir=/pb/pb_data", "--hooksDir=/pb/pb_hooks"]
