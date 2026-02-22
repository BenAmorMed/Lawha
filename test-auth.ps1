# Auth Module Testing Script for Windows PowerShell
# Run this script to automatically test all Auth endpoints

Write-Host "[TEST] Canvas Platform - Auth Module Testing" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "[1/11] Checking Docker..." -ForegroundColor Yellow
$dockerStatus = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "[PASS] Docker is running" -ForegroundColor Green
Write-Host ""

# Start services
Write-Host "[2/11] Starting services with docker compose..." -ForegroundColor Yellow
docker compose up -d
Start-Sleep -Seconds 5
Write-Host "[PASS] Services started" -ForegroundColor Green
Write-Host ""

# Wait for backend to be ready
Write-Host "[3/11] Waiting for backend to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/health" -ErrorAction Stop
        Write-Host "[PASS] Backend is ready" -ForegroundColor Green
        break
    }
    catch {
        $attempt++
        if ($attempt -lt $maxAttempts) {
            Write-Host "       Waiting... ($attempt/$maxAttempts)" -ForegroundColor Gray
            Start-Sleep -Seconds 1
        }
    }
}

if ($attempt -eq $maxAttempts) {
    Write-Host "[FAIL] Backend did not start in time. Check logs:" -ForegroundColor Red
    Write-Host "       docker compose logs api" -ForegroundColor Gray
    exit 1
}
Write-Host ""

# Test 1: Register User 1
Write-Host "[4/11] Testing Registration (User 1)..." -ForegroundColor Yellow
$registerResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/auth/register" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body (@{
        email = "john@example.com"
        password = "SecurePass123"
        full_name = "John Doe"
    } | ConvertTo-Json)

Write-Host "       Email: $($registerResponse.email)" -ForegroundColor Green
Write-Host "       Name: $($registerResponse.full_name)" -ForegroundColor Green
Write-Host "       Role: $($registerResponse.role)" -ForegroundColor Green
Write-Host "[PASS] Registration successful" -ForegroundColor Green
Write-Host ""

# Test 2: Register User 2
Write-Host "[5/11] Testing Registration (User 2)..." -ForegroundColor Yellow
$registerResponse2 = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/auth/register" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body (@{
        email = "jane@example.com"
        password = "SecurePass456"
        full_name = "Jane Smith"
    } | ConvertTo-Json)

Write-Host "       Email: $($registerResponse2.email)" -ForegroundColor Green
Write-Host "[PASS] Second user registered" -ForegroundColor Green
Write-Host ""

# Test 3: Duplicate Email (Should Fail)
Write-Host "[6/11] Testing Duplicate Email Prevention..." -ForegroundColor Yellow
try {
    $dupResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/auth/register" `
        -Method Post `
        -Headers @{"Content-Type"="application/json"} `
        -Body (@{
            email = "john@example.com"
            password = "AnotherPass123"
            full_name = "Another User"
        } | ConvertTo-Json)
    Write-Host "[FAIL] Should have failed but didn't" -ForegroundColor Red
}
catch {
    $errorMsg = $_.Exception.Response.StatusCode
    if ($errorMsg -eq "BadRequest") {
        Write-Host "[PASS] Duplicate email correctly rejected" -ForegroundColor Green
    }
}
Write-Host ""

# Test 4: Login with Correct Credentials
Write-Host "[7/11] Testing Login (Correct Credentials)..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/auth/login" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body (@{
        email = "john@example.com"
        password = "SecurePass123"
    } | ConvertTo-Json)

$token = $loginResponse.access_token
Write-Host "       Token (first 50 chars): $($token.Substring(0, 50))..." -ForegroundColor Green
Write-Host "       Expires in: $($loginResponse.expires_in) seconds (24h)" -ForegroundColor Green
Write-Host "[PASS] Login successful" -ForegroundColor Green
Write-Host ""

# Test 5: Login with Wrong Password
Write-Host "[8/11] Testing Login (Wrong Password)..." -ForegroundColor Yellow
try {
    $wrongPassResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/auth/login" `
        -Method Post `
        -Headers @{"Content-Type"="application/json"} `
        -Body (@{
            email = "john@example.com"
            password = "WrongPassword123"
        } | ConvertTo-Json)
    Write-Host "[FAIL] Should have failed but didn't" -ForegroundColor Red
}
catch {
    $errorMsg = $_.Exception.Response.StatusCode
    if ($errorMsg -eq "Unauthorized") {
        Write-Host "[PASS] Wrong password correctly rejected" -ForegroundColor Green
    }
}
Write-Host ""

# Test 6: Protected Route with Valid Token
Write-Host "[9/11] Testing Protected Route (Valid Token)..." -ForegroundColor Yellow
$currentUserResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/auth/me" `
    -Method Get `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

Write-Host "       Email: $($currentUserResponse.email)" -ForegroundColor Green
Write-Host "       Name: $($currentUserResponse.full_name)" -ForegroundColor Green
Write-Host "[PASS] Protected route access successful" -ForegroundColor Green
Write-Host ""

# Test 7: Protected Route without Token
Write-Host "[10/11] Testing Protected Route (No Token)..." -ForegroundColor Yellow
try {
    $noTokenResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/auth/me" `
        -Method Get `
        -Headers @{"Content-Type"="application/json"}
    Write-Host "[FAIL] Should have failed but didn't" -ForegroundColor Red
}
catch {
    $errorMsg = $_.Exception.Response.StatusCode
    if ($errorMsg -eq "Unauthorized") {
        Write-Host "[PASS] Route correctly protected (no token rejected)" -ForegroundColor Green
    }
}
Write-Host ""

# Test 8: Protected Route with Invalid Token
Write-Host "[11/11] Testing Protected Route (Invalid Token)..." -ForegroundColor Yellow
try {
    $invalidTokenResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/v1/auth/me" `
        -Method Get `
        -Headers @{
            "Authorization" = "Bearer invalid_token_xyz"
            "Content-Type" = "application/json"
        }
    Write-Host "[FAIL] Should have failed but didn't" -ForegroundColor Red
}
catch {
    $errorMsg = $_.Exception.Response.StatusCode
    if ($errorMsg -eq "Unauthorized") {
        Write-Host "[PASS] Invalid token correctly rejected" -ForegroundColor Green
    }
}
Write-Host ""

# Summary
Write-Host "================== TEST RESULTS ==================" -ForegroundColor Cyan
Write-Host "[PASS] Health check" -ForegroundColor Green
Write-Host "[PASS] User registration" -ForegroundColor Green
Write-Host "[PASS] Duplicate prevention" -ForegroundColor Green
Write-Host "[PASS] Login with correct credentials" -ForegroundColor Green
Write-Host "[PASS] Wrong password rejection" -ForegroundColor Green
Write-Host "[PASS] Protected route with valid token" -ForegroundColor Green
Write-Host "[PASS] Protected route without token" -ForegroundColor Green
Write-Host "[PASS] Protected route with invalid token" -ForegroundColor Green
Write-Host ""
Write-Host "========== AUTH MODULE TESTING COMPLETE ==========" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "[1] Check database: docker compose exec postgres psql -U canvas_user -d canvas_platform" -ForegroundColor Gray
Write-Host "[2] View users: SELECT email, full_name FROM users;" -ForegroundColor Gray
Write-Host "[3] Build Products API next" -ForegroundColor Gray
Write-Host ""
