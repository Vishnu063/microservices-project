
````bash
cd ~/microservices-project

cp README.md README.backup.md

cat > README.md <<'EOF'
# 🚀 Microservices DevSecOps CI/CD Platform

A production-style **DevSecOps CI/CD platform built on AWS**.

This project demonstrates the complete application delivery lifecycle:

```text
Developer
    ↓
GitHub
    ↓
Jenkins
    ↓
Gitleaks + Tests
    ↓
Docker Build
    ↓
Trivy Security Scan
    ↓
Amazon ECR
    ↓
Helm
    ↓
Amazon EKS
    ↓
Kubernetes
    ↓
Frontend + Backend + Redis
    ↓
Prometheus + Grafana
````

---

# 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │      DEVELOPER       │
                         │                      │
                         │ Frontend             │
                         │ Backend              │
                         │ Dockerfiles          │
                         │ Helm Charts          │
                         │ Jenkinsfile          │
                         └──────────┬───────────┘
                                    │
                                 git push
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       GITHUB         │
                         │                      │
                         │ Source Code          │
                         │ Jenkinsfile          │
                         │ Dockerfiles          │
                         │ Helm                  │
                         │ Infrastructure       │
                         └──────────┬───────────┘
                                    │
                              CI/CD Trigger
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │           JENKINS            │
                    │                              │
                    │        CI/CD PIPELINE        │
                    └──────────────┬───────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
       ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
       │  GITLEAKS   │      │    TESTS    │      │   DOCKER    │
       │             │      │             │      │    BUILD    │
       │ Secret Scan │      │ Application │      │             │
       │             │      │ Tests       │      │ Frontend    │
       └─────────────┘      └─────────────┘      │ Backend     │
                                                  └──────┬──────┘
                                                         │
                                                         ▼
                                                  ┌─────────────┐
                                                  │    TRIVY    │
                                                  │             │
                                                  │ Image Scan  │
                                                  │ CVE Scan    │
                                                  └──────┬──────┘
                                                         │
                                                   Scan Passed
                                                         │
                                                         ▼
                                      ┌─────────────────────────────┐
                                      │         AMAZON ECR           │
                                      │                             │
                                      │  frontend:<BUILD_NUMBER>   │
                                      │  backend:<BUILD_NUMBER>    │
                                      │                             │
                                      └──────────────┬──────────────┘
                                                     │
                                               Image Reference
                                                     │
                                                     ▼
                                      ┌─────────────────────────────┐
                                      │            HELM             │
                                      │                             │
                                      │ Chart: helm/myapp           │
                                      │ Repository: ECR             │
                                      │ Tag: Jenkins BUILD_NUMBER   │
                                      └──────────────┬──────────────┘
                                                     │
                                              helm upgrade
                                                     │
                                                     ▼
              ┌────────────────────────────────────────────────────────┐
              │                       AMAZON EKS                        │
              │                                                        │
              │                    microservices-eks                    │
              │                                                        │
              │  ┌──────────────────────────────────────────────────┐  │
              │  │              MANAGED NODE GROUP                  │  │
              │  │                                                  │  │
              │  │   ┌────────────────┐    ┌────────────────┐       │  │
              │  │   │   t3.small     │    │   t3.small     │       │  │
              │  │   │    NODE 1      │    │    NODE 2      │       │  │
              │  │   │                │    │                │       │  │
              │  │   │ 172.31.20.63   │    │ 172.31.46.26   │       │  │
              │  │   └───────┬────────┘    └───────┬────────┘       │  │
              │  └───────────┼─────────────────────┼────────────────┘  │
              │              │                     │                   │
              │              └──────────┬──────────┘                   │
              │                         │                              │
              │                         ▼                              │
              │              ┌─────────────────────┐                  │
              │              │ Kubernetes Scheduler│                  │
              │              └──────────┬──────────┘                  │
              │                         │                              │
              │              ┌──────────┼───────────┐                  │
              │              │          │           │                  │
              │              ▼          ▼           ▼                  │
              │        ┌──────────┐ ┌──────────┐ ┌──────────┐          │
              │        │ FRONTEND │ │ BACKEND  │ │  REDIS   │          │
              │        │          │ │          │ │          │          │
              │        │ 2 Pods   │ │ 2 Pods   │ │ 1 Pod    │          │
              │        └────┬─────┘ └────┬─────┘ └────┬─────┘          │
              │             │            │            │                │
              │             └────────────┼────────────┘                │
              │                          │                             │
              │                          ▼                             │
              │                 Kubernetes Services                   │
              │                          │                             │
              └──────────────────────────┼─────────────────────────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │ PROMETHEUS + GRAFANA │
                              │                     │
                              │ Node Metrics        │
                              │ Pod Metrics         │
                              │ CPU / Memory        │
                              │ Cluster Health      │
                              └─────────────────────┘
```

---

# 🔄 Complete CI/CD Flow

The pipeline works in this order:

```text
1. Developer writes code
          ↓
2. Code pushed to GitHub
          ↓
3. Jenkins checks out code
          ↓
4. Gitleaks scans for secrets
          ↓
5. Application tests run
          ↓
6. Docker images are built
          ↓
7. Trivy scans Docker images
          ↓
8. Images pushed to Amazon ECR
          ↓
9. Jenkins generates image tag
          ↓
10. Helm receives ECR image
          ↓
11. Helm deploys to EKS
          ↓
12. Kubernetes creates/updates Pods
          ↓
13. Jenkins verifies deployment
          ↓
14. Prometheus collects metrics
          ↓
15. Grafana displays metrics
```

---

# 🔐 Security Flow

Security is integrated into the CI/CD pipeline.

```text
                 CODE
                   │
                   ▼
              ┌─────────┐
              │ Gitleaks│
              └────┬────┘
                   │
              Secret Found?
              /           \
            YES            NO
             │             │
             ▼             ▼
           STOP          Continue
                           │
                           ▼
                     Docker Build
                           │
                           ▼
                        Trivy
                           │
                    Vulnerability?
                     /          \
                   YES           NO
                    │             │
                    ▼             ▼
                  STOP          ECR
```

---

# 🔐 Gitleaks

Gitleaks scans the repository for accidentally committed secrets.

It can detect:

* AWS credentials
* API keys
* Passwords
* Tokens
* Private keys
* Sensitive credentials

If a secret is detected, the pipeline can stop before deployment.

---

# 🛡️ Trivy

Trivy scans Docker images for security vulnerabilities.

```text
Docker Image
     ↓
   Trivy
     ↓
OS Packages
Dependencies
Libraries
Known CVEs
     ↓
Security Decision
```

This helps prevent vulnerable container images from being deployed.

---

# 🐳 Docker

The project contains two application services:

```text
services/
├── frontend/
│   └── Dockerfile
│
└── backend/
    └── Dockerfile
```

Jenkins builds both images.

```text
Frontend Source
      ↓
Docker Build
      ↓
frontend:<BUILD_NUMBER>


Backend Source
      ↓
Docker Build
      ↓
backend:<BUILD_NUMBER>
```

---

# 📦 Amazon ECR

Amazon ECR is the private container registry.

Repositories:

```text
frontend
backend
```

Region:

```text
ap-south-1
```

Example:

```text
138300868541.dkr.ecr.ap-south-1.amazonaws.com/frontend:7

138300868541.dkr.ecr.ap-south-1.amazonaws.com/backend:7
```

---

# 🏷️ Docker Image Versioning

Jenkins uses:

```text
BUILD_NUMBER
```

as the image tag.

Example:

```text
BUILD_NUMBER=7
```

creates:

```text
frontend:7
backend:7
```

Next build:

```text
BUILD_NUMBER=8
```

creates:

```text
frontend:8
backend:8
```

This provides:

* Version tracking
* Easier debugging
* Deployment history
* Rollback capability

---

# ⛵ Helm

Helm manages the Kubernetes deployment.

Chart location:

```text
helm/myapp/
```

Important files:

```text
helm/myapp/
├── Chart.yaml
├── values.yaml
└── templates/
    ├── backend-deployment.yaml
    ├── frontend-deployment.yaml
    ├── redis.yaml
    └── services
```

Jenkins passes the ECR repository and image tag to Helm.

```bash
helm upgrade --install myapp . \
  --set backend.image.repository=${ECR_REGISTRY}/${BACKEND_REPO} \
  --set backend.image.tag=${IMAGE_TAG} \
  --set frontend.image.repository=${ECR_REGISTRY}/${FRONTEND_REPO} \
  --set frontend.image.tag=${IMAGE_TAG}
```

The important concept is:

```text
Jenkins BUILD_NUMBER
        ↓
Docker Image Tag
        ↓
ECR
        ↓
Helm
        ↓
Kubernetes Deployment
```

---

# ☸️ Amazon EKS

The application runs on Amazon EKS.

Cluster:

```text
microservices-eks
```

Region:

```text
ap-south-1
```

Node group:

```text
microservices-ng
```

Worker instance type:

```text
t3.small
```

Current architecture:

```text
EKS Cluster
     │
     ▼
Managed Node Group
     │
     ├── t3.small
     │
     └── t3.small
```

The EKS control plane manages Kubernetes.

EC2 worker nodes provide compute resources where Pods run.

---

# 🖥️ Kubernetes Worker Nodes

The worker nodes currently running the application are:

```text
Node 1
172.31.20.63
t3.small

Node 2
172.31.46.26
t3.small
```

Kubernetes schedules application Pods across these nodes.

Example:

```text
Node 1
├── Backend Pod
├── Frontend Pod
└── Redis Pod

Node 2
├── Backend Pod
└── Frontend Pod
```

The exact Pod placement can change because Kubernetes decides where Pods should run.

---

# 🚀 Kubernetes Workloads

The application contains:

```text
Frontend
├── Replica 1
└── Replica 2

Backend
├── Replica 1
└── Replica 2

Redis
└── Replica 1
```

Current desired state:

```text
Frontend → 2 Pods
Backend  → 2 Pods
Redis    → 1 Pod
```

---

# 🔗 Kubernetes Services

Services provide stable networking inside Kubernetes.

Without Services:

```text
Pod
 ↓
Changing Pod IP
```

With Services:

```text
Application
     ↓
Kubernetes Service
     ↓
Pod
```

Pods can be replaced while the Service continues providing a stable endpoint.

---

# 💾 Redis

Redis is deployed as a Kubernetes workload.

Current configuration:

```text
Redis
└── 1 Pod
```

Redis can be used by the backend for application data, caching, sessions, queues, or other fast-access operations depending on the application implementation.

---

# 📊 Monitoring

The monitoring architecture is:

```text
Kubernetes
     │
     │ Metrics
     ▼
Prometheus
     │
     │ Queries
     ▼
Grafana
     │
     ▼
Dashboards
```

Monitoring can provide visibility into:

* Kubernetes nodes
* Pods
* CPU
* Memory
* Cluster health
* Application availability
* Workload performance

---

# 🔑 AWS IAM

IAM controls access to AWS resources.

The project uses IAM-based access where possible instead of placing long-term AWS credentials directly into Jenkins.

Important AWS services:

```text
IAM
EKS
ECR
EC2
CloudFormation
Security Groups
```

---

# 🏗️ Infrastructure

Infrastructure is stored under:

```text
infra/
```

The infrastructure layer is responsible for AWS resources required by the project.

Examples include:

* EKS
* EC2
* IAM
* Security Groups
* Networking
* Other AWS infrastructure

Infrastructure as Code makes the environment reproducible and easier to manage.

---

# 📂 Project Structure

```text
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
```

---

# 🔍 Deployment Verification

After deployment, Jenkins verifies the Kubernetes environment.

## Check EKS Cluster

```bash
aws eks describe-cluster \
  --name microservices-eks \
  --region ap-south-1
```

## Configure kubectl

```bash
aws eks update-kubeconfig \
  --region ap-south-1 \
  --name microservices-eks
```

## Check Nodes

```bash
kubectl get nodes -o wide
```

## Check All Pods

```bash
kubectl get pods -A
```

## Check Deployments

```bash
kubectl get deployments
```

## Check Services

```bash
kubectl get services
```

## Check Helm

```bash
helm list
```

## Check Backend Image

```bash
kubectl get deployment myapp-backend \
  -o jsonpath='{.spec.template.spec.containers[0].image}'; echo
```

## Check Frontend Image

```bash
kubectl get deployment myapp-frontend \
  -o jsonpath='{.spec.template.spec.containers[0].image}'; echo
```

## Check ECR Backend Images

```bash
aws ecr list-images \
  --repository-name backend \
  --region ap-south-1
```

## Check ECR Frontend Images

```bash
aws ecr list-images \
  --repository-name frontend \
  --region ap-south-1
```

---

# 🧪 Troubleshooting

## Check Pod Status

```bash
kubectl get pods -o wide
```

## Describe a Pod

```bash
kubectl describe pod <POD_NAME>
```

## Check Pod Logs

```bash
kubectl logs <POD_NAME>
```

## Check Backend Deployment

```bash
kubectl describe deployment myapp-backend
```

## Check Frontend Deployment

```bash
kubectl describe deployment myapp-frontend
```

## Check Current Images

```bash
kubectl get deployments \
  -o custom-columns=NAME:.metadata.name,IMAGE:.spec.template.spec.containers[0].image
```

## Check Helm Values

```bash
helm get values myapp
```

## Check Helm Manifest

```bash
helm get manifest myapp
```

---

# 🧠 Important Design Decisions

## Why Jenkins?

Jenkins connects the entire CI/CD process:

```text
GitHub
 ↓
Security
 ↓
Testing
 ↓
Docker
 ↓
Trivy
 ↓
ECR
 ↓
Helm
 ↓
EKS
```

---

## Why Gitleaks?

To detect secrets before they reach later stages of the pipeline.

---

## Why Trivy?

To identify known vulnerabilities in container images before deployment.

---

## Why Docker?

Docker packages the application and its dependencies into portable container images.

---

## Why ECR?

ECR provides a private AWS container registry that integrates with AWS IAM and EKS.

---

## Why Helm?

Helm makes Kubernetes deployments reusable and allows image repositories and tags to be supplied dynamically.

---

## Why EKS?

EKS provides a managed Kubernetes control plane while EC2 worker nodes provide application compute capacity.

---

## Why Image Tags?

Image tags connect a Jenkins build to a specific application version.

Example:

```text
Jenkins Build 7
       ↓
frontend:7
backend:7
       ↓
ECR
       ↓
Helm
       ↓
EKS
```

---

# 🎯 DevSecOps Concepts Demonstrated

```text
Source Control
      +
CI/CD
      +
Security
      +
Testing
      +
Containerization
      +
Container Security
      +
Container Registry
      +
Infrastructure as Code
      +
Kubernetes
      +
Helm
      +
Monitoring
```

Implemented:

* ✅ GitHub
* ✅ Jenkins
* ✅ Gitleaks
* ✅ Application Testing
* ✅ Docker
* ✅ Trivy
* ✅ Amazon ECR
* ✅ Amazon EKS
* ✅ Kubernetes
* ✅ Helm
* ✅ AWS IAM
* ✅ Kubernetes Services
* ✅ Application Replicas
* ✅ Prometheus
* ✅ Grafana
* ✅ Deployment Verification

---

# 💼 Resume Description

Built an end-to-end AWS DevSecOps CI/CD platform using Jenkins, Docker, Amazon ECR, Amazon EKS and Helm. Implemented automated source checkout, Gitleaks secret scanning, application testing, Trivy container vulnerability scanning, Docker image versioning, ECR image publishing and Helm-based Kubernetes deployments. Deployed frontend, backend and Redis workloads on EKS using managed EC2 worker nodes and implemented deployment verification, IAM-based AWS authentication and Prometheus/Grafana monitoring.

---

# 👨‍💻 Author

**Vishnu Kushwaha**

DevOps / DevSecOps Engineer

---

# ⭐ Project Objective

The objective of this project is to demonstrate a real-world DevSecOps workflow where application delivery is automated from source code to a running Kubernetes workload.

```text
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
```

The final goal is a repeatable, secure and automated software delivery platform.
EOF

echo
echo "===== README UPDATED SUCCESSFULLY ====="
wc -l README.md
echo
echo "===== FIRST 20 LINES ====="
head -20 README.md
echo
echo "===== README BACKUP ====="
ls -lh README.md README.backup.md

````
