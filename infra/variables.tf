variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type (t2.micro / t3.micro are Free Tier eligible)"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Name of an existing EC2 Key Pair to SSH into the instance"
  type        = string
}

variable "my_ip" {
  description = "Your public IP in CIDR form, e.g. 1.2.3.4/32 — restricts SSH/Jenkins access to you"
  type        = string
}

variable "project_name" {
  description = "Name prefix used for tagging resources"
  type        = string
  default     = "microservices-cicd"
}
