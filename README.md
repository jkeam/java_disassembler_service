# Java Disassembler Service
A micro-service that disassembles your Java code.

## Setup

### Prereq
1.  Docker

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

#### Java 6
1.  Build the image from the Dockerfile
  ```
  docker build -t javabytes/java6-diss-service -f ./images/java6_dockerfile .
  ```

2.  Run docker
  ```
  docker run -p 8886:8886 -d -e ENV_PORT=8886 javabytes/java6-diss-service
  ```

3.  Ensure its running
  ```
  curl -i localhost:8886
  ```

#### Java 7
1.  Build the image from the Dockerfile
  ```
  docker build -t javabytes/java7-diss-service -f ./images/java7_dockerfile .
  ```

2.  Run docker
  ```
  docker run -p 8887:8887 -d -e ENV_PORT=8887 javabytes/java7-diss-service
  ```

3.  Ensure its running
  ```
  curl -i localhost:8887
  ```

#### Java 8
1.  Build the image from the Dockerfile
  ```
  docker build -t javabytes/java8-diss-service -f ./images/java8_dockerfile .
  ```

2.  Run docker
  ```
  docker run -p 8888:8888 -d -e ENV_PORT=8888 javabytes/java8-diss-service
  ```

3.  Ensure its running
  ```
  curl -i localhost:8888
  ```

#### Java 9
1.  Build the image from the Dockerfile
  ```
  docker build -t javabytes/java9-diss-service -f ./images/java9_dockerfile .
  ```

2.  Run docker
  ```
  docker run -p 8889:8889 -d -e ENV_PORT=8889 javabytes/java9-diss-service
  ```

3.  Ensure its running
  ```
  curl -i localhost:8889
  ```
