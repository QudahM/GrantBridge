# Define all configurable parameters for infrastructure

# Domain Configuration
variable "domain_name" {
  description = "Primary domain name for GrantBridge"
  type        = string
  default     = "grantbridge.online"
}

variable "web_server_ip" {
  description = "Web server IP address for A record"
  type        = string
  # Primary web server IP address
  # Example: "185.201.10.123"
}

variable "api_server_endpoint" {
  description = "Backend API server endpoint"
  type        = string
  # Backend service endpoint
  # Example: "api-backend.example.com"
}

variable "primary_mx_server" {
  description = "Primary mail exchange server"
  type        = string
  default     = "mx1.mailservice.com"
}

variable "secondary_mx_server" {
  description = "Secondary mail exchange server"
  type        = string
  default     = "mx2.mailservice.com"
}

variable "spf_record" {
  description = "SPF record for email authentication"
  type        = string
  default     = "v=spf1 include:_spf.mailservice.com ~all"
}

# Cloudflare Configuration
variable "cloudflare_api_token" {
  description = "Cloudflare API token for DNS management"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for the domain"
  type        = string
  sensitive   = true
}

# Sentry Configuration
variable "sentry_auth_token" {
  description = "Sentry authentication token"
  type        = string
  sensitive   = true
}

variable "sentry_organization" {
  description = "Sentry organization slug"
  type        = string
  default     = "grantbridge"
}

variable "sentry_team" {
  description = "Sentry team slug"
  type        = string
  default     = "grantbridge-team"
}

# Environment Configuration
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# Project Configuration
variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "grantbridge"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "GrantBridge"
    Environment = "production"
    ManagedBy   = "Terraform"
    Owner       = "GrantBridge-Team"
  }
}
