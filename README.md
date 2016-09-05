# Java Disassembler Service
A very simple service that disassembles your Java code.

## Setup

### Prereq
1.  Docker

### Build Image

#### Java 8
1.  Build the image from the Dockerfile
`docker build -t javabytes/java8-diss-service -f ./images/java8_dockerfile .`

2.  Run docker
`docker run -p 8888:8888 -d -e ENV_PORT=8888 javabytes/java8-diss-service`

3.  To connect
`docker exec -it <container id> /bin/bash`

4.  Ensure its running
  ```
  # see it running
  docker ps

  # hit the service
  curl -i localhost:8888
  ```
