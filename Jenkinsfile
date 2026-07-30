pipeline {

    agent any

    environment {
        AWS_REGION      = "ap-south-1"
        AWS_ACCOUNT_ID  = "138300868541"
        ECR_REGISTRY    = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        BACKEND_REPO    = "backend"
        FRONTEND_REPO   = "frontend"

        IMAGE_TAG       = "${env.BUILD_NUMBER}"
    }


    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }


        stage('Test Backend') {
            steps {
                dir('services/backend') {
                    sh '''
                    npm install
                    npm test
                    '''
                }
            }
        }


        stage('AWS ECR Login') {
            steps {
                sh '''
                aws ecr get-login-password --region ${AWS_REGION} | \
                docker login --username AWS \
                --password-stdin ${ECR_REGISTRY}
                '''
            }
        }


        stage('Build & Push Backend Image') {
            steps {
                dir('services/backend') {
                    sh '''
                    docker build \
                    -t ${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG} \
                    -t ${ECR_REGISTRY}/${BACKEND_REPO}:latest .

                    docker push ${ECR_REGISTRY}/${BACKEND_REPO}:${IMAGE_TAG}
                    docker push ${ECR_REGISTRY}/${BACKEND_REPO}:latest
                    '''
                }
            }
        }


        stage('Build & Push Frontend Image') {
            steps {
                dir('services/frontend') {
                    sh '''
                    docker build \
                    -t ${ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG} \
                    -t ${ECR_REGISTRY}/${FRONTEND_REPO}:latest .

                    docker push ${ECR_REGISTRY}/${FRONTEND_REPO}:${IMAGE_TAG}
                    docker push ${ECR_REGISTRY}/${FRONTEND_REPO}:latest
                    '''
                }
            }
        }


        stage('Deploy using Helm') {
            steps {
                dir('helm/myapp') {
                    sh '''
                    helm upgrade --install myapp . \
                    --set backend.image.repository=${ECR_REGISTRY}/${BACKEND_REPO} \
                    --set backend.image.tag=${IMAGE_TAG} \
                    --set frontend.image.repository=${ECR_REGISTRY}/${FRONTEND_REPO} \
                    --set frontend.image.tag=${IMAGE_TAG} \
                    --wait \
                    --timeout 120s
                    '''
                }
            }
        }


        stage('Verify Kubernetes Deployment') {
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
            echo "CI/CD Deployment Successful - Build ${IMAGE_TAG}"
        }

        failure {
            echo "Pipeline Failed - Check Jenkins Logs"
        }

        always {
            sh '''
            docker logout ${ECR_REGISTRY} || true
            '''
        }
    }
}
