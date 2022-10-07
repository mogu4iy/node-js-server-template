FROM nikolaik/python-nodejs:python3.10-nodejs16

RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY healthcheck_requirements.txt healthcheck_requirements.txt
RUN python3 -m pip install -r healthcheck_requirements.txt

COPY package*.json ./
RUN npm install
COPY . .

ENTRYPOINT sh ./healthcheck.sh && sh ./entrypoint.sh