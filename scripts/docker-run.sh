#!/bin/bash

# Docker helper script for running Playwright tests
# Usage: ./scripts/docker-run.sh [test-type] [environment]

set -e

# Default values
TEST_TYPE=${1:-"all"}
ENVIRONMENT=${2:-"local"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Running Playwright tests in Docker${NC}"
echo -e "${YELLOW}Test Type: ${TEST_TYPE}${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"

# Load environment variables if .env file exists
if [ -f ".env.${ENVIRONMENT}" ]; then
    echo -e "${GREEN}Loading environment variables from .env.${ENVIRONMENT}${NC}"
    export $(cat .env.${ENVIRONMENT} | grep -v '#' | xargs)
fi

# Ensure reports directory exists
mkdir -p reports test-results allure-results screenshots

# Build the Docker image
echo -e "${BLUE}Building Docker image...${NC}"
docker build -t playwright-tests .

# Function to run tests
run_tests() {
    local service_name=$1
    local command=$2
    
    echo -e "${BLUE}Running ${service_name}...${NC}"
    
    docker run --rm \
        --name "${service_name}" \
        -e TEST_ENV="${ENVIRONMENT}" \
        -e BASE_URL="${BASE_URL:-https://playwright.dev}" \
        -e API_BASE_URL="${API_BASE_URL:-https://api.example.com}" \
        -e API_TOKEN="${API_TOKEN:-}" \
        -e HEADLESS=true \
        -e CI=true \
        -v "$(pwd)/reports:/app/reports" \
        -v "$(pwd)/test-results:/app/test-results" \
        -v "$(pwd)/allure-results:/app/allure-results" \
        -v "$(pwd)/screenshots:/app/screenshots" \
        playwright-tests \
        ${command}
}

# Run different test types based on input
case $TEST_TYPE in
    "all")
        run_tests "playwright-all" "npm test"
        ;;
    "smoke")
        run_tests "playwright-smoke" "npm run test:smoke"
        ;;
    "api")
        run_tests "playwright-api" "npm run test:api"
        ;;
    "visual")
        run_tests "playwright-visual" "npm run test:visual"
        ;;
    "a11y"|"accessibility")
        run_tests "playwright-a11y" "npm run test:a11y"
        ;;
    "performance"|"perf")
        run_tests "playwright-perf" "npx playwright test tests/performance"
        ;;
    "chrome")
        run_tests "playwright-chrome" "npm run test:chrome"
        ;;
    "firefox")
        run_tests "playwright-firefox" "npm run test:firefox"
        ;;
    "webkit")
        run_tests "playwright-webkit" "npm run test:webkit"
        ;;
    "mobile")
        run_tests "playwright-mobile" "npm run test:mobile"
        ;;
    *)
        echo -e "${RED}Unknown test type: ${TEST_TYPE}${NC}"
        echo "Available test types: all, smoke, api, visual, a11y, performance, chrome, firefox, webkit, mobile"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Tests completed!${NC}"

# Check if reports were generated
if [ -d "reports/html-report" ]; then
    echo -e "${GREEN}📊 HTML report available at: reports/html-report/index.html${NC}"
fi

if [ -d "allure-results" ] && [ "$(ls -A allure-results)" ]; then
    echo -e "${GREEN}📊 Allure results generated. Run 'npm run allure:serve' to view the report.${NC}"
fi

echo -e "${BLUE}To serve reports via nginx, run: docker-compose --profile reporting up nginx-reports${NC}"