# 🚀 Microservices DevSecOps CI/CD Platform

A production-style DevSecOps CI/CD platform built on AWS using Terraform, Jenkins, Docker, Kubernetes, Helm, Amazon ECR, Trivy, Gitleaks, Prometheus and Grafana.

The project automates the complete software delivery lifecycle:

Code Commit → Security Scan → Test → Docker Build → Image Scan → Push to ECR → Kubernetes Deployment → Monitoring


# 🏗️ Architecture


                         GitHub Repository
                                |
                                |
                         Jenkins Pipeline
                                |
        ------------------------------------------------
        |              |              |                |
     Unit Test     Gitleaks        Trivy          Build Docker
        |              |              |                |
        ------------------------------------------------
                                |
                                |
                         Amazon ECR Registry
                                |
                                |
                          Helm Deployment
                                |
                                |
                       Kubernetes (k3s Cluster)
                                |
              ---------------------------------
              |               |               |
          Frontend        Backend          Redis
              |
              |
       Prometheus + Grafana Monitoring



# 🛠️ Technology Stack


## Cloud
- AWS EC2
- AWS IAM
- Amazon ECR
- AWS CLI


## Infrastructure as Code
- Terraform


## CI/CD
- Jenkins Pipeline
- GitHub Integration


## Containerization
- Docker
- Docker Images
- Docker Registry


## Kubernetes
- k3s Kubernetes Cluster
- Helm Charts
- Services
- Deployments
- ReplicaSets


## Security (DevSecOps)
- Trivy Container Vulnerability Scanner
- Gitleaks Secret Scanner


## Monitoring
- Prometheus
- Grafana
- Kubernetes Metrics


# 🔄 CI/CD Pipeline Flow


1. Developer pushes code to GitHub

2. Jenkins automatically triggers pipeline

3. Source code checkout

4. Application testing

5. Gitleaks scans repository for exposed secrets

6. Trivy scans Docker images for vulnerabilities

7. Docker images are created

8. Images are pushed to Amazon ECR

9. Helm deploys application to Kubernetes

10. Kubernetes manages application availability


# 🔐 DevSecOps Security Implementation


## Gitleaks

Used for detecting:

- AWS keys
- Password leaks
- API tokens
- Sensitive credentials


## Trivy

Used for scanning:

- Docker image vulnerabilities
- OS package vulnerabilities
- Application dependencies


Security scanning is integrated directly into Jenkins pipeline.


# ☁️ AWS Infrastructure


Terraform provisions:

- EC2 Instance
- IAM Role
- Security Groups
- Required permissions


IAM Role based authentication is used instead of storing AWS access keys inside Jenkins.


# 🐳 Docker Implementation


Two microservices are containerized:

## Backend Service

Technology:
- Node.js


## Frontend Service

Technology:
- HTML
- JavaScript


Docker images are:

- Built automatically
- Tagged with versions
- Stored in Amazon ECR


# ☸️ Kubernetes Deployment


Application runs on k3s Kubernetes cluster.


Implemented:

- Deployments
- Services
- Replica management
- Container health checks
- Horizontal scaling support


Helm is used for:

- Template management
- Version control
- Easy deployment
- Rollback capability


# 📦 Amazon ECR


Docker images are stored securely in AWS ECR.

Benefits:

- Private container registry
- IAM authentication
- AWS integration
- Secure image management


# 📊 Monitoring


Monitoring stack:

- Prometheus
- Grafana


Monitors:

- Kubernetes nodes
- Pod health
- CPU utilization
- Memory usage
- Cluster performance


# 📂 Project Structure

microservices-project/
├── Jenkinsfile
├── terraform/
│ └── AWS Infrastructure
├── services/
│ ├── frontend/
│ └── backend/
├── helm/
│ └── myapp/
├── Dockerfiles
└── README.md


# 🚀 Deployment Commands


## Check Kubernetes Pods
kubectl get pods


## Check Helm Releases
helm list


## Check ECR Images
aws ecr describe-images


# 🎯 Key DevOps/DevSecOps Achievements


✅ Automated CI/CD pipeline using Jenkins

✅ Infrastructure provisioning using Terraform

✅ Containerized applications using Docker

✅ Private image management using AWS ECR

✅ Kubernetes deployment using Helm

✅ Integrated security scanning into CI/CD

✅ Implemented IAM-based AWS authentication

✅ Added monitoring using Prometheus and Grafana


# 💼 Resume Project Description


Built an end-to-end DevSecOps CI/CD platform on AWS by automating infrastructure provisioning with Terraform, implementing Jenkins-based CI/CD pipelines, containerizing microservices with Docker, managing images through Amazon ECR, deploying applications on Kubernetes using Helm, and integrating security scanning using Trivy and Gitleaks with monitoring through Prometheus and Grafana.


# 👨‍💻 Author

Vishnu Kushwaha

DevOps / DevSecOps Engineer

