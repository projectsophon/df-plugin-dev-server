include .env
export

up:
	docker-compose -f docker-compose.yml up -d

up-build:
	docker-compose -f docker-compose.yml up --build --remove-orphans

stop:
	docker-compose -f docker-compose.yml stop

down:
	docker-compose -f docker-compose.yml down

build:
	docker-compose -f docker-compose.yml build  

restart:
	docker-compose -f docker-compose.yml restart

copy:
	./scripts/update_plugins.sh