#!/bin/bash

# GrantBridge Terraform Setup Script
# Automates the initial setup process for infrastructure as code

set -e  # Exit on any error

echo "GrantBridge Terraform Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Terraform is installed
check_terraform() {
    echo -e "${BLUE}Checking Terraform installation...${NC}"
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}Terraform is not installed${NC}"
        echo "Please install Terraform from: https://www.terraform.io/downloads"
        exit 1
    fi

    TERRAFORM_VERSION=$(terraform version -json | jq -r '.terraform_version')
    echo -e "${GREEN}Terraform ${TERRAFORM_VERSION} found${NC}"
}

# Check if required files exist
check_files() {
    echo -e "${BLUE}Checking required files...${NC}"

    if [ ! -f "terraform.tfvars" ]; then
        echo -e "${YELLOW}terraform.tfvars not found${NC}"
        echo "Creating from example..."
        cp terraform.tfvars.example terraform.tfvars
        echo -e "${YELLOW}Please edit terraform.tfvars with your actual values${NC}"
        echo -e "${BLUE}Tip: Use terraform.tfvars.local.example for provider-specific values${NC}"
        return 1
    fi

    echo -e "${GREEN}Configuration files found${NC}"
    return 0
}

# Validate Terraform configuration
validate_config() {
    echo -e "${BLUE}Validating Terraform configuration...${NC}"

    if terraform validate; then
        echo -e "${GREEN}Configuration is valid${NC}"
    else
        echo -e "${RED}Configuration validation failed${NC}"
        exit 1
    fi
}

# Initialize Terraform
init_terraform() {
    echo -e "${BLUE}Initializing Terraform...${NC}"

    if terraform init; then
        echo -e "${GREEN}Terraform initialized successfully${NC}"
    else
        echo -e "${RED}Terraform initialization failed${NC}"
        exit 1
    fi
}

# Plan deployment
plan_deployment() {
    echo -e "${BLUE}Creating deployment plan...${NC}"

    if terraform plan -out=tfplan; then
        echo -e "${GREEN}Plan created successfully${NC}"
        echo -e "${YELLOW}Review the plan above before applying${NC}"
    else
        echo -e "${RED}Planning failed${NC}"
        exit 1
    fi
}

# Apply deployment (with confirmation)
apply_deployment() {
    echo -e "${YELLOW}Ready to apply infrastructure changes${NC}"
    read -p "Do you want to apply these changes? (yes/no): " confirm

    if [ "$confirm" = "yes" ]; then
        echo -e "${BLUE}Applying Terraform configuration...${NC}"

        if terraform apply tfplan; then
            echo -e "${GREEN}Infrastructure deployed successfully!${NC}"
            show_outputs
        else
            echo -e "${RED}Deployment failed${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}Deployment cancelled${NC}"
        echo "You can apply later with: terraform apply tfplan"
    fi
}

# Show important outputs
show_outputs() {
    echo -e "${BLUE}Infrastructure Outputs${NC}"
    echo "=========================="

    echo -e "${GREEN}Sentry DSNs (add to your .env files):${NC}"
    echo "Frontend DSN: $(terraform output -raw sentry_frontend_dsn 2>/dev/null || echo 'Not available')"
    echo "Backend DSN: $(terraform output -raw sentry_backend_dsn 2>/dev/null || echo 'Not available')"

    echo -e "${GREEN}Application URLs:${NC}"
    terraform output application_urls 2>/dev/null || echo "URLs not available"

    echo -e "${GREEN}Infrastructure Status:${NC}"
    terraform output infrastructure_status 2>/dev/null || echo "Status not available"
}

# Main execution
main() {
    echo "Starting setup process..."

    # Change to terraform directory
    cd "$(dirname "$0")"

    # Run setup steps
    check_terraform

    if ! check_files; then
        echo -e "${YELLOW}Please edit terraform.tfvars and run this script again${NC}"
        exit 0
    fi

    validate_config
    init_terraform
    plan_deployment

    # Ask if user wants to apply
    apply_deployment

    echo -e "${GREEN}Setup complete!${NC}"
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Add Sentry DSNs to your application .env files"
    echo "2. Update your application to use the new DNS records"
    echo "3. Test your application with the new infrastructure"
    echo ""
    echo -e "${YELLOW}Tip: Run 'terraform output' anytime to see configuration values${NC}"
}

# Run main function
main "$@"
