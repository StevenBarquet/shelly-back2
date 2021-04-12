droplet ssh keys: https://www.mediafire.com/file/nnf3472016r4ajr/Droplet_keys.rar/file
instal node https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04
install mongo https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-mongodb-on-ubuntu-16-04

Create User: https://www.digitalocean.com/community/tutorials/how-to-add-and-delete-users-on-ubuntu-18-04

adduser newuser

connect ssesion in mobaxterm
	host: 159.89.116.171
	advance ssh and use private key file
	login as root
	switch user with su - botz2
	sudo systemctl start mongod
	sudo systemctl status mongod
	cd home/botz2

    docker run -d --name shelly-app-container --env DEBUG=app:* --env shelly_store_backend_mpToken=APP_USR-3764181139893912-021917-19f76dc258dc96a8b805be5b88182db5-522092531 --env shelly_store_backend_mailPass=comic456 -p 4000:4000 -d c3985870097a

    docker container logs shelly-container

-Docker:
Install
	https://docs.docker.com/engine/install/ubuntu/

check version
    sudo docker version

Make starts automaticaly when system boots
    sudo systemctl start docker && sudo systemctl enable docker

Add docker commands
    sudo usermod -aG docker <User>

Check docker engine is running
    sudo systemctl status docker

See the list of all docker images
    docker image ls

See the list of all docker containers
    docker container ls

See the list of all docker containers that has run
    docker container ls -a

See the list of all docker containers that are running
    docker container ps

Start a container that already exist
    docker container start [ID/Name of the container]

Stop a container that already is running
    docker container stop [ID/Name of the container]

Puse a container that already is running
    docker container stop [ID/Name of the container]

Unpuse a container that already is running
    docker container unpause [ID/Name of the container]

Check logs of requests of the container
    docker container logs [ID/Name of the container]

Check real time usage of resources (memory, data transfer, etc)
    docker container stats [ID/Name of the container]

Execute commands inside the container
    docker container exec -it [ID/Name of the container] /bin/bash
Exit of a container bash (do not stops de container)
    exit

Remove one container
    docker container rm [ID/Name of the container] // -f if container is running

Remove all stoped container
    docker container prune

Build an image from a dockerfile
    docker image build -t [name of the image] .
    docker image build -t botz2/shelly-image:v1 .
    

Run docker image with environment variables
    docker run -d --name [containerName] --env ENV_VAR=VALUE -p [port]:[port] nodejs-server-env

----------------------------------------------------------------
    Steps for update backend

log as root
su - botz2
cd /home/botz2/myFiles/shelly/
sudo git pull origin master
docker container ls
docker container rm -f 
docker image ls
docker image rm -f 
docker build -t shelly_back_image .
docker image ls
docker run --link shelly-mongo:mongo --name shelly-back-container --network shelly-network  -p 5000:5000 -d shelly_back_image
docker container ls
docker container logs shelly-back-container

check changes done in postman

Other:

docker build -t ssl-example/image .
docker run --name SSL-example-container -p 5001:5001 -d ssl-example/image  
----------------------------------------------------------------
    Create and connect network 

docker network create <NAME>

docker volume create my-volume // real data created in /var/lib/docker/volumes/my-volume

docker run --name some-mongo -d mongo:tag

docker run -it --network some-network --rm mongo mongo --host some-mongo test

docker run --name some-mongo -v /my/own/datadir:/data/db -d mongo

Final command mongo create mongodb cluster in local server

    docker network create manual-network-shelly

 docker run -it --name shelly-mongo --network manual-network-shelly -v shelly-volume:/data/db -d mongo:latest

 --name <NAME>
 --network <Network Name> // to restart always in that network

 -v <Volume Name>:/data/db //first must be a volume created with docker volume create if doesnt exist

 -d mongo:latest //version of mongo
 --link shelly-mongo:mongo //Link a node app to a mongo container and then named 'mongo' for //mongo:27017/shelly-store
 
Build and running node-app
    // in dir of node app
    //docker build -t <your username>/node-web-app .
    docker build -t shelly_backend/custom-app .
    // docker run -p 49160:8080 -d <your username>/node-web-app
    docker run --link shelly-mongo:mongo --name shelly-manual-backend --network manual-network -p 4000:4000 -d shelly_backend/custom-app

docker run -p 5001:5001 --name ssl-example-container -d ssl-example/node-app