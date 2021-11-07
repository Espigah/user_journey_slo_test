loadtest:
	k6 run --out json=loadtestresult.json --summary-trend-stats="min,avg,med,p(99),p(99.9),max,count" --summary-time-unit=ms  loadtest.k6.js

loadtest-docker:
	docker run -i loadimpact/k6 run - <loadtest.k6.js

up-rabbitmq:
	docker-compose up -d rabbitmq

up:
	docker-compose up -d --build --force-recreate

run:
	cd app && \
	MESSAGE='basket ->' \
	RABBIT_QUEUE_INPUT=ORDER_CREATED \
	RABBIT_QUEUE_OUTPUT=CREATE_ORDER \
	RABBIT_QUEUE_OUTPUT_IGNORE_MESSAGE=ordering \
	APP_NAME=basket \
	RABBIT_HOST=http://localhost:5672 \
	npm start 

install:
	cd app && npm i && cd --
	npm i -g k6
	cd grafana && git clone https://github.com/grafana/grafonnet-lib.git && cd -
#	sudo apt-get install jsonnet
#	pip install jsonnet
#	snap install jsonnet
	

build-dashboard:
	cd grafana &&  jsonnet -J grafonnet-lib dashboard.jsonnet > provisioning/dashboards/dashboard.json && cd -

create-dashbaord:
	cd grafana && sh ./create-dashbaord.sh && cd -