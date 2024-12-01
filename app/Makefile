# Variables
DOCKER_USER=ehsafin
FRONTEND_IMAGE=${DOCKER_USER}/poridhi-exam-frontend:latest
BACKEND_IMAGE=${DOCKER_USER}/poridhi-exam-backend:latest

# Build Frontend Image
build-frontend:
	docker build -t ${FRONTEND_IMAGE} ./frontend

# Build Backend Image
build-backend:
	docker build -t ${BACKEND_IMAGE} ./backend

# Push Frontend Image to Docker Hub
push-frontend:
	docker push ${FRONTEND_IMAGE}

# Push Backend Image to Docker Hub
push-backend:
	docker push ${BACKEND_IMAGE}

deploy-frontend: build-frontend push-frontend

deploy-backend: build-backend push-backend


# Deploy Both images
deploy-all: deploy-frontend deploy-backend
