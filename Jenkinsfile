pipeline {

agent any


environment {

AWS_REGION="ap-south-1"

AWS_ACCOUNT_ID="138300868541"

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

BACKEND_REPO="backend"

FRONTEND_REPO="frontend"

IMAGE_TAG="${BUILD_NUMBER}"

}


stages {


stage('Checkout') {

steps {

checkout scm

}

}



stage('Gitleaks Secret Scan') {

steps {

sh '''

echo "Running Secret Scan"

gitleaks detect \
--source . \
--exit-code 0

'''

}

}



stage('Backend Test') {

steps {

dir('services/backend') {

sh '''

npm install

npm test

'''

}

}

}



stage('Trivy File System Scan') {

steps {

sh '''

trivy fs . \
--severity HIGH,CRITICAL \
--exit-code 0

'''

}

}



stage('AWS ECR Login') {

steps {

sh '''

aws ecr get-login-password \
--region ${AWS_REGION} |

docker login \
--username AWS \
--password-stdin ${ECR_REGISTRY}

'''

}

}



stage('Build Backend Image') {

steps {

dir('services/backend') {

sh '''

docker build \
-t ${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG} .

docker push \
${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG}

'''

}

}

}



stage('Scan Backend Image') {

steps {

sh '''

trivy image \
${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG} \
--severity HIGH,CRITICAL \
--exit-code 0

'''

}

}



stage('Build Frontend Image') {

steps {

dir('services/frontend') {

sh '''

docker build \
-t ${ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG} .

docker push \
${ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG}

'''

}

}

}



stage('Scan Frontend Image') {

steps {

sh '''

trivy image \
${ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG} \
--severity HIGH,CRITICAL \
--exit-code 0

'''

}

}



stage('Deploy Helm') {

steps {

dir('helm/myapp') {

sh '''

set -eu

echo "===== DEPLOY VARIABLES ====="

echo "ECR_REGISTRY=${ECR_REGISTRY}"
echo "BACKEND_REPO=${BACKEND_REPO}"
echo "FRONTEND_REPO=${FRONTEND_REPO}"
echo "IMAGE_TAG=${IMAGE_TAG}"

test -n "${ECR_REGISTRY}"
test -n "${BACKEND_REPO}"
test -n "${FRONTEND_REPO}"
test -n "${IMAGE_TAG}"

BACKEND_IMAGE="${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG}"
FRONTEND_IMAGE="${ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG}"

echo "Backend image: ${BACKEND_IMAGE}"
echo "Frontend image: ${FRONTEND_IMAGE}"

echo "===== HELM RENDER TEST ====="

helm template myapp . \
  --set backend.image.repository="${ECR_REGISTRY}/${BACKEND_REPO}" \
  --set backend.image.tag="${IMAGE_TAG}" \
  --set frontend.image.repository="${ECR_REGISTRY}/${FRONTEND_REPO}" \
  --set frontend.image.tag="${IMAGE_TAG}" \
  | grep -E 'image:'

echo "===== HELM DEPLOY ====="

helm upgrade --install myapp . \
  --set backend.image.repository="${ECR_REGISTRY}/${BACKEND_REPO}" \
  --set backend.image.tag="${IMAGE_TAG}" \
  --set frontend.image.repository="${ECR_REGISTRY}/${FRONTEND_REPO}" \
  --set frontend.image.tag="${IMAGE_TAG}"

'''

}

}

}



stage('Verify Deployment') {

steps {

sh '''

kubectl get pods

helm list

'''

}

}


}


post {


success {

echo "DEVSECOPS PIPELINE COMPLETED SUCCESSFULLY"

}


failure {

echo "PIPELINE FAILED"

}


}

}
