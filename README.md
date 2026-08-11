# 🚀 Microservices DevSecOps CI/CD Platform

A production-style **DevSecOps CI/CD platform built on AWS**.

This project demonstrates how application code moves from **GitHub → Jenkins → Security Scanning → Docker → Amazon ECR → Helm → Amazon EKS → Kubernetes → Monitoring**.

The goal is to create an automated and secure software delivery pipeline where security, testing, containerization, deployment, and verification are handled through CI/CD.

---

# 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │      Developer       │
                         │                      │
                         │  Application Code    │
                         │  Dockerfiles         │
                         │  Helm Charts         │
                         │  Jenkinsfile         │
                         └──────────┬───────────┘
                                    │
                                    │ git push
                                    ▼
                         ┌──────────────────────┐
                         │       GitHub         │
                         │   Source Repository  │
                         └──────────┬───────────┘
                                    │
                                    │ CI/CD Trigger
                                    ▼
                    ┌───────────────────────────────┐
                    │           Jenkins             │
                    │                               │
                    │       CI/CD Pipeline          │
                    └──────────────┬────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
       ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
       │   Gitleaks  │      │ Application │      │    Docker   │
       │             │      │    Tests    │      │    Build    │
       │ Secret Scan │      │             │      │             │
       └─────────────┘      └─────────────┘      └──────┬──────┘
                                                        │
                                                        ▼
                                                 ┌─────────────┐
                                                 │    Trivy    │
                                                 │             │
                                                 │ Image Scan  │
                                                 └──────┬──────┘
                                                        │
                                                        │ Secure Image
                                                        ▼
                                          ┌─────────────────────────┐
                                          │       Amazon ECR        │
                                          │                         │
                                          │  ┌───────────────────┐  │
                                          │  │     backend       │  │
                                          │  │     :BUILD_ID     │  │
                                          │  └───────────────────┘  │
                                          │                         │
                                          │  ┌───────────────────┐  │
                                          │  │     frontend      │  │
                                          │  │     :BUILD_ID     │  │
                                          │  └───────────────────┘  │
                                          └────────────┬────────────┘
                                                       │
                                                       │ Image Reference
                                                       ▼
                                          ┌─────────────────────────┐
                                          │          Helm           │
                                          │                         │
                                          │ Helm Templates          │
                                          │ + ECR Repository        │
                                          │ + Image Tag             │
                                          └────────────┬────────────┘
                                                       │
                                                       │ helm upgrade
                                                       ▼
              ┌──────────────────────────────────────────────────────┐
              │                     Amazon EKS                       │
              │                                                      │
              │                 microservices-eks                    │
              │                                                      │
              │    ┌──────────────────────────────────────────┐     │
              │    │          Managed Node Group              │     │
              │    │                                          │     │
              │    │   ┌────────────┐    ┌────────────┐       │     │
              │    │   │ t3.small   │    │ t3.small   │       │     │
              │    │   │   Node 1   │    │   Node 2   │       │     │
              │    │   └─────┬──────┘    └─────┬──────┘       │     │
              │    └──────────┼─────────────────┼─────────────┘     │
              │               │                 │                   │
              │               └────────┬────────┘                   │
              │                        │                            │
              │                        ▼                            │
              │              Kubernetes Scheduler                  │
              │                        │                            │
              │          ┌─────────────┼──────────────┐             │
              │          │             │              │             │
              │          ▼             ▼              ▼             │
              │     ┌──────────┐ ┌──────────┐ ┌──────────┐          │
              │     │ Frontend │ │ Backend  │ │  Redis   │          │
              │     │ 2 Pods   │ │ 2 Pods   │ │ 1 Pod    │          │
              │     └────┬─────┘ └────┬─────┘ └────┬─────┘          │
              │          │             │             │                │
              │          └─────────────┼─────────────┘                │
              │                        │                              │
              │              Kubernetes Services                     │
              └────────────────────────┼─────────────────────────────┘
                                       │
                                       ▼
                            ┌──────────────────────┐
                            │ Prometheus + Grafana │
                            │                      │
                            │ Cluster Monitoring   │
                            │ Pod Monitoring       │
                            │ CPU / Memory         │
                            └──────────────────────┘
🔄 How The Architecture Works
1. Developer
The developer works with:
Frontend source code
Backend source code
Dockerfiles
Helm charts
Jenkins pipeline
The code is pushed to GitHub.
2. GitHub
GitHub acts as the source-code repository.
The repository contains:
microservices-project/
├── services/
├── helm/
├── infra/
├── Jenkinsfile
└── README.md
A code change starts the CI/CD process.
3. Jenkins
Jenkins is the main CI/CD engine.
The Jenkins pipeline automates:
Checkout
   ↓
Security Scan
   ↓
Tests
   ↓
Docker Build
   ↓
Image Scan
   ↓
Push to ECR
   ↓
Helm Deployment
   ↓
Deployment Verification
This removes the need to manually build and deploy the application.
🔐 4. Gitleaks
Gitleaks runs during CI.
Its purpose is to detect accidentally committed secrets.
Examples:
AWS credentials
API keys
Passwords
Tokens
Private keys
Other sensitive values
The pipeline can stop when secrets are detected.
🧪 5. Application Testing
Jenkins runs application tests before deployment.
The purpose is simple:
Code
 ↓
Test
 ↓
If successful → Continue
If failed → Stop
This prevents broken application code from reaching production infrastructure.
🐳 6. Docker
The application contains two main services:
services/
├── frontend/
└── backend/
Jenkins builds a Docker image for each service.
Frontend Source
      ↓
Docker Build
      ↓
Frontend Image

Backend Source
      ↓
Docker Build
      ↓
Backend Image
🛡️ 7. Trivy
After Docker images are built, Trivy scans them for vulnerabilities.
Docker Image
     ↓
   Trivy
     ↓
Vulnerability Check
Trivy can detect:
OS package vulnerabilities
Application dependency vulnerabilities
Known CVEs
Vulnerable libraries
Only images that pass the required security checks continue through the pipeline.
📦 8. Amazon ECR
Amazon ECR is used as the private Docker image registry.
Repositories:
frontend
backend
AWS Region:
ap-south-1
AWS Account:
138300868541
Example image locations:
138300868541.dkr.ecr.ap-south-1.amazonaws.com/backend:<TAG>

138300868541.dkr.ecr.ap-south-1.amazonaws.com/frontend:<TAG>
🏷️ 9. Image Versioning
Jenkins uses the Jenkins build number as the Docker image tag.
For example:
BUILD_NUMBER=7
creates:
backend:7
frontend:7
This is important because every CI/CD build can represent a different application version.
Example:
Build 5
backend:5
frontend:5

Build 6
backend:6
frontend:6

Build 7
backend:7
frontend:7
This makes deployments easier to track and roll back.
⛵ 10. Helm
Helm manages the Kubernetes deployment.
The Helm chart is located at:
helm/myapp/
The chart contains Kubernetes templates for:
Backend
Frontend
Redis
Services
Configuration
Resource requests
Resource limits
Jenkins passes the ECR repository and image tag to Helm.
Example:
helm upgrade --install myapp . \
  --set backend.image.repository=${ECR_REGISTRY}/${BACKEND_REPO} \
  --set backend.image.tag=${IMAGE_TAG} \
  --set frontend.image.repository=${ECR_REGISTRY}/${FRONTEND_REPO} \
  --set frontend.image.tag=${IMAGE_TAG}
This means the Kubernetes deployment always receives the image generated by the current Jenkins build.
☸️ 11. Amazon EKS
The application runs on Amazon EKS.
Cluster:
microservices-eks
Region:
ap-south-1
Node group:
microservices-ng
Current worker nodes use:
t3.small
The EKS control plane manages the Kubernetes cluster while EC2 instances provide the worker capacity.
🖥️ 12. Kubernetes Worker Nodes
The worker nodes run the application Pods.
Example:
EKS
│
└── Managed Node Group
    │
    ├── Node 1 - t3.small
    │
    └── Node 2 - t3.small
Kubernetes schedules Pods across the available worker nodes.
🚀 13. Application Workloads
The application currently contains:
Frontend
 └── 2 replicas

Backend
 └── 2 replicas

Redis
 └── 1 replica
Example:
EKS
│
├── Frontend
│   ├── Pod 1
│   └── Pod 2
│
├── Backend
│   ├── Pod 1
│   └── Pod 2
│
└── Redis
    └── Pod 1
Multiple replicas provide basic application redundancy.
🔗 14. Kubernetes Services
Kubernetes Services provide stable networking for application components.
Instead of applications depending on changing Pod IP addresses:
Pod IP
172.31.x.x
applications communicate through Kubernetes Services.
This allows Pods to be replaced without breaking application communication.
💾 15. Redis
Redis is deployed as a Kubernetes workload.
It is used as the application's Redis service.
Current deployment:
Redis
└── 1 Pod
📊 16. Monitoring
The monitoring layer uses:
Prometheus
     ↓
Metrics Collection
     ↓
Grafana
     ↓
Visualization
Monitoring can provide visibility into:
Kubernetes nodes
Pod health
CPU usage
Memory usage
Application availability
Cluster performance
🔑 AWS IAM
AWS IAM is used to control access to AWS resources.
The architecture avoids storing long-term AWS access keys directly inside the Jenkins pipeline where possible.
IAM roles provide controlled AWS permissions.
Main AWS resources include:
EC2
EKS
ECR
IAM
CloudFormation
Security Groups
🏗️ Infrastructure
Infrastructure is managed using Infrastructure as Code where applicable.
The infrastructure layer contains:
infra/
Infrastructure includes AWS resources such as:
EC2
IAM
Security Groups
EKS
Networking resources
📂 Project Structure
microservices-project/
│
├── Jenkinsfile
├── Jenkinsfile.backup
├── README.md
├── docker-compose.yml
│
├── services/
│   ├── frontend/
│   │   ├── Dockerfile
│   │   └── application files
│   │
│   └── backend/
│       ├── Dockerfile
│       └── application files
│
├── helm/
│   └── myapp/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── backend-deployment.yaml
│           ├── frontend-deployment.yaml
│           ├── redis.yaml
│           └── ...
│
└── infra/
    └── AWS infrastructure
🔄 Complete CI/CD Flow
The complete pipeline is:
Developer
    │
    ▼
GitHub
    │
    ▼
Jenkins
    │
    ├── Gitleaks
    │
    ├── Application Tests
    │
    ├── Docker Build
    │
    └── Trivy
            │
            ▼
       Amazon ECR
            │
            │ Image + Tag
            ▼
          Helm
            │
            │ helm upgrade
            ▼
        Amazon EKS
            │
            ▼
    Kubernetes Scheduler
            │
       ┌────┼────┐
       ▼    ▼    ▼
   Frontend Backend Redis
    2 Pods   2 Pods  1 Pod
       │       │      │
       └───────┼──────┘
               ▼
        Kubernetes Services
               │
               ▼
       Application Traffic
               │
               ▼
      Prometheus + Grafana
🔍 Deployment Verification
After deployment, Jenkins verifies the Kubernetes workloads.
Useful commands:
Check EKS Cluster
aws eks describe-cluster \
  --name microservices-eks \
  --region ap-south-1
Configure kubectl
aws eks update-kubeconfig \
  --region ap-south-1 \
  --name microservices-eks
Check Nodes
kubectl get nodes -o wide
Check All Pods
kubectl get pods -A
Check Deployments
kubectl get deployments
Check Services
kubectl get services
Check Helm
helm list
Check Backend Image
kubectl get deployment myapp-backend \
  -o jsonpath='{.spec.template.spec.containers[0].image}'; echo
Check Frontend Image
kubectl get deployment myapp-frontend \
  -o jsonpath='{.spec.template.spec.containers[0].image}'; echo
Check ECR Images
aws ecr list-images \
  --repository-name backend \
  --region ap-south-1
aws ecr list-images \
  --repository-name frontend \
  --region ap-south-1
🎯 DevSecOps Principles Demonstrated
This project demonstrates:
Security
   +
Automation
   +
Infrastructure as Code
   +
Containerization
   +
Continuous Integration
   +
Continuous Deployment
   +
Kubernetes
   +
Monitoring
Key implementations:
✅ Jenkins CI/CD
✅ GitHub source control
✅ Gitleaks secret scanning
✅ Automated application testing
✅ Docker containerization
✅ Trivy vulnerability scanning
✅ Amazon ECR
✅ Amazon EKS
✅ Kubernetes
✅ Helm
✅ IAM-based AWS authentication
✅ Application replicas
✅ Kubernetes Services
✅ Prometheus
✅ Grafana
✅ Deployment verification
🧠 Important Design Decisions
Why ECR?
ECR provides a private AWS-native container registry that integrates directly with IAM and EKS.
Why Helm?
Helm makes Kubernetes deployments reusable and allows image repositories and tags to be changed without manually editing Kubernetes manifests.
Why EKS?
EKS provides a managed Kubernetes control plane while EC2 worker nodes provide compute capacity.
Why Jenkins?
Jenkins automates the complete CI/CD process and connects source control, security tools, Docker, AWS, Helm and Kubernetes.
Why Gitleaks?
To prevent accidentally committing sensitive credentials.
Why Trivy?
To detect vulnerabilities inside container images before deployment.
Why Image Tags?
Image tags allow each Jenkins build to be associated with a specific application version.
💼 Resume Description
Built an end-to-end AWS DevSecOps CI/CD platform using Jenkins, Docker, Amazon ECR, Amazon EKS and Helm. Implemented automated source checkout, Gitleaks secret scanning, application testing, Trivy container vulnerability scanning, Docker image versioning, ECR image publishing and Kubernetes deployments. Configured Helm-based application delivery to EKS with frontend, backend and Redis workloads, IAM-based AWS authentication, deployment verification and Prometheus/Grafana monitoring.
👨‍💻 Author
Vishnu Kushwaha
DevOps / DevSecOps Engineer
⭐ Project Objective
The objective of this project is to demonstrate a real-world DevSecOps workflow where application delivery is automated from source code to a running Kubernetes workload.
CODE
 ↓
SECURITY
 ↓
TEST
 ↓
BUILD
 ↓
SCAN
 ↓
PUSH
 ↓
DEPLOY
 ↓
VERIFY
 ↓
MONITOR
The final goal is a repeatable, secure and automated software delivery platform.
