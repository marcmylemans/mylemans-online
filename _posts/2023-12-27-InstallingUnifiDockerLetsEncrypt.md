---
title: installing a Unifi Controller with Docker and Lets Encrypt!
description: Install Docker and Docker Compose on Ubuntu and run a UniFi controller behind jwilder/nginx-proxy with a Let's Encrypt certificate from one compose file.
date: '2023-12-27 09:00:00'
categories: [Self-hosting, Networking]
tags: [docker, unifi]
image: {path: /assets/img/posts/covers/installingunifidockerletsencrypt.jpg, alt: installing a Unifi Controller with Docker and Lets Encrypt!}
---

# Docker and Docker Compose Installation and Usage Guide

## Installing Docker

### For Ubuntu/Linux:

1) Update your existing list of packages:

```
sudo apt update
```

2) Next, install a few prerequisite packages which let apt use packages over HTTPS:

```
sudo apt install apt-transport-https ca-certificates curl software-properties-common
```

3) Then add the GPG key for the official Docker repository to your system:

```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

4) Add the Docker repository to APT sources:

```
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
```

5) Finally, install Docker:

```
sudo apt install docker.io
```

## Running a Docker Compose File

1) Install docker Compose

```
apt-install docker-compose
```

2) Create a `docker-compose.yml` file in your desired directory.

```yaml
version: '3'

services:
  nginx-proxy:
    image: jwilder/nginx-proxy:alpine
    container_name: nginx-proxy
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - /var/docker/nginx-proxy/certs:/etc/nginx/certs:ro
      - /var/docker/nginx-proxy/conf.d:/etc/nginx/conf.d
      - /var/docker/nginx-proxy/vhost.d:/etc/nginx/vhost.d
      - /usr/share/nginx/html:/usr/share/nginx/html
    ports:
      - "80:80"
      - "443:443"
    labels:
      - "com.github.jrcs.letsencrypt_nginx_proxy_companion.nginx_proxy"

  unifi:
    image: linuxserver/unifi-controller
    container_name: unifi
    restart: unless-stopped
    environment:
      - VIRTUAL_HOST={subdomain}
      - VIRTUAL_PORT=8443
      - VIRTUAL_PROTO=https
      - LETSENCRYPT_HOST={subdomain}
      - LETSENCRYPT_EMAIL=your@email.com
    volumes:
      - /var/docker/unifi:/config
    ports:
      - "3478:3478/udp"
      - "8080:8080"

  nginx-letsencrypt:
    image: jrcs/letsencrypt-nginx-proxy-companion
    container_name: nginx-letsencrypt
    restart: unless-stopped
    volumes_from:
      - nginx-proxy
    volumes:
      - /var/docker/nginx-proxy/certs:/etc/nginx/certs:rw
      - /var/run/docker.sock:/var/run/docker.sock:ro

```

2) Run the following command in the directory containing your `docker-compose.yml`:
```
docker-compose up -d
```

## Stopping Containers

To stop and remove all containers defined in the `docker-compose.yml` file, use:

```
docker-compose down
```
