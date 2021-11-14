# Java Disassembler Service
[![Build Status](https://travis-ci.org/jkeam/java_disassembler_service.svg?branch=master)](https://travis-ci.org/jkeam/java_disassembler_service)

A micro-service that disassembles your Java code.

## Setup

### Prereq
1.  Docker
2.  Tmp dir exists
  ```
  mkdir /tmp/javabytes
  ```

### Build Image
Some quick and useful docker commands:
  ```
  # connect to the running instance
  docker exec -it <container id> /bin/bash

  # see all containers
  docker ps -a

  # see all images
  docker images

  # delete container
  docker rm <container id>

  # delete image
  docker rmi <image id>
  ```

#### Java
Instructions below assume X is the java version.

1.  Build the image from the Dockerfile

```
docker build -t javabytes/javaX-diss-service -f ./dockerfiles/javaX_dockerfile .
```

2.  Run docker
```
docker run -p 3000:3000 javabytes/javaX-diss-service
```

3.  Ensure its running
  ```
  curl -i localhost:3000
  ```
