@echo off
REM Docker helper script for running Playwright tests on Windows
REM Usage: scripts\docker-run.bat [test-type] [environment]

setlocal enabledelayedexpansion

REM Default values
set TEST_TYPE=%1
set ENVIRONMENT=%2
if "%TEST_TYPE%"=="" set TEST_TYPE=all
if "%ENVIRONMENT%"=="" set ENVIRONMENT=local

echo 🐳 Running Playwright tests in Docker
echo Test Type: %TEST_TYPE%
echo Environment: %ENVIRONMENT%

REM Load environment variables if .env file exists
if exist ".env.%ENVIRONMENT%" (
    echo Loading environment variables from .env.%ENVIRONMENT%
    for /f "usebackq tokens=*" %%a in (".env.%ENVIRONMENT%") do (
        set line=%%a
        if not "!line:~0,1!"=="#" (
            set %%a
        )
    )
)

REM Ensure reports directory exists
if not exist "reports" mkdir reports
if not exist "test-results" mkdir test-results
if not exist "allure-results" mkdir allure-results
if not exist "screenshots" mkdir screenshots

REM Build the Docker image
echo Building Docker image...
docker build -t playwright-tests .

REM Set default environment variables if not set
if "%BASE_URL%"=="" set BASE_URL=https://playwright.dev
if "%API_BASE_URL%"=="" set API_BASE_URL=https://api.example.com
if "%API_TOKEN%"=="" set API_TOKEN=

REM Function to run tests
set DOCKER_CMD=docker run --rm -e TEST_ENV=%ENVIRONMENT% -e BASE_URL=%BASE_URL% -e API_BASE_URL=%API_BASE_URL% -e API_TOKEN=%API_TOKEN% -e HEADLESS=true -e CI=true -v "%cd%\reports:/app/reports" -v "%cd%\test-results:/app/test-results" -v "%cd%\allure-results:/app/allure-results" -v "%cd%\screenshots:/app/screenshots" playwright-tests

REM Run different test types based on input
if "%TEST_TYPE%"=="all" (
    echo Running all tests...
    %DOCKER_CMD% npm test
) else if "%TEST_TYPE%"=="smoke" (
    echo Running smoke tests...
    %DOCKER_CMD% npm run test:smoke
) else if "%TEST_TYPE%"=="api" (
    echo Running API tests...
    %DOCKER_CMD% npm run test:api
) else if "%TEST_TYPE%"=="visual" (
    echo Running visual tests...
    %DOCKER_CMD% npm run test:visual
) else if "%TEST_TYPE%"=="a11y" (
    echo Running accessibility tests...
    %DOCKER_CMD% npm run test:a11y
) else if "%TEST_TYPE%"=="accessibility" (
    echo Running accessibility tests...
    %DOCKER_CMD% npm run test:a11y
) else if "%TEST_TYPE%"=="performance" (
    echo Running performance tests...
    %DOCKER_CMD% npx playwright test tests/performance
) else if "%TEST_TYPE%"=="perf" (
    echo Running performance tests...
    %DOCKER_CMD% npx playwright test tests/performance
) else if "%TEST_TYPE%"=="chrome" (
    echo Running Chrome tests...
    %DOCKER_CMD% npm run test:chrome
) else if "%TEST_TYPE%"=="firefox" (
    echo Running Firefox tests...
    %DOCKER_CMD% npm run test:firefox
) else if "%TEST_TYPE%"=="webkit" (
    echo Running WebKit tests...
    %DOCKER_CMD% npm run test:webkit
) else if "%TEST_TYPE%"=="mobile" (
    echo Running mobile tests...
    %DOCKER_CMD% npm run test:mobile
) else (
    echo Unknown test type: %TEST_TYPE%
    echo Available test types: all, smoke, api, visual, a11y, performance, chrome, firefox, webkit, mobile
    exit /b 1
)

echo ✅ Tests completed!

REM Check if reports were generated
if exist "reports\html-report" (
    echo 📊 HTML report available at: reports\html-report\index.html
)

if exist "allure-results" (
    dir /b allure-results >nul 2>&1 && (
        echo 📊 Allure results generated. Run 'npm run allure:serve' to view the report.
    )
)

echo To serve reports via nginx, run: docker-compose --profile reporting up nginx-reports

endlocal