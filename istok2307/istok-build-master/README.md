
Cloning repositaries

git clone git@gitlab.vlan:OlegP/istok-build.git

Or
Get Update from repo

git pull 

Build istok images

./build.sh


Commit Changes
git add .
git commit -m "comment commit"
git push -u origin master


docker ps - show containers
docker stop $(docker ps -a -q) - stop all containers
docker rm $(docker ps -a -q) - remove all containers
ocker rmi -f $(docker images -a -q) - remove all images
