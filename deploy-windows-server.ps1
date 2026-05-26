<#
.SYNOPSIS
    Script trien khai tu dong Cong thong tin & Dat lich kham len Windows Server may chu Vien.
.DESCRIPTION
    Script nay chay tren may Dev ca nhan de:
    1. Kiem tra moi truong Node.js.
    2. Bien dich (Build) du an Frontend va Backend.
    3. Dong goi ZIP sach (khong kem node_modules).
    4. Anh xa (Mount) o dia mang C$ cua server 192.168.1.34 thanh o Z:.
    5. Copy cac goi dong goi len server.
    6. Tao file helper `server-setup.ps1` tren server de giai nen va dang ky Windows Services tu dong qua NSSM.
#>

$ErrorActionPreference = "Stop"
$ServerIP = "192.168.1.34"
$ServerUser = "Administrator"
$ServerPass = "Admin@123!@#"
$ServerDeployDir = "Z:\inetpub\wwwroot\vien-ydh-website"

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "🚀 BAT DAU QUY TRINH TRIEN KHAI NATIVE LEN WINDOWS SERVER" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# ──────────────────────────────────────────────────────────────────────────
# BUOC 1: KIEM TRA MOI TRUONG DEV VA BIEN DICH BAN SAN XUAT (BUILD)
# ──────────────────────────────────────────────────────────────────────────
Write-Host "`n1. Dang kiem tra moi truong Node.js..." -ForegroundColor Cyan
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Loi: Khong tim thay Node.js tren may Dev nay! Hay cai dat truoc khi chay script."
}

# 1.1. Build Backend
Write-Host "`n1.1. Dang bien dich Backend..." -ForegroundColor Cyan
Push-Location "backend"
npm run build
Pop-Location

# 1.2. Build Frontend
Write-Host "`n1.2. Dang bien dich Frontend (Next.js)..." -ForegroundColor Cyan
Push-Location "vien-ydh-frontend"
npm run build
Pop-Location

# ──────────────────────────────────────────────────────────────────────────
# BUOC 2: DONG GOI GOI TIN SACH (PACK ZIP)
# ──────────────────────────────────────────────────────────────────────────
Write-Host "`n2. Dang dong goi ZIP ma nguon sach..." -ForegroundColor Cyan
$TempDir = Join-Path $Pshome "..\..\..\Temp\VienYDHDT_Deploy"
if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
New-Item -ItemType Directory -Path $TempDir | Out-Null

$BackendZip = Join-Path $TempDir "backend.zip"
$FrontendZip = Join-Path $TempDir "frontend.zip"

# Nen Backend (chi bao gom dist, package.json, config, va cac file can thiet)
Write-Host "-> Dang nen Backend..." -ForegroundColor Gray
Compress-Archive -Path "backend\dist", "backend\package.json", "backend\src" -DestinationPath $BackendZip -Force

# Nen Frontend (bao gom .next, public, package.json, next.config.ts, messages)
Write-Host "-> Dang nen Frontend..." -ForegroundColor Gray

# Xoa thu muc cache cua Next.js truoc khi nen de tang toc do (thu muc nay khong can thiet cho production)
$NextCachePath = "vien-ydh-frontend\.next\cache"
if (Test-Path $NextCachePath) {
    Write-Host "-> Dang don dep thu muc cache Next.js de tang toc..." -ForegroundColor Gray
    Remove-Item -Path $NextCachePath -Recurse -Force
}

# Xoa thu muc dev tam de tranh khoa tap tin va giảm kich thuoc
$NextDevPath = "vien-ydh-frontend\.next\dev"
if (Test-Path $NextDevPath) {
    Write-Host "-> Dang don dep thu muc dev Next.js..." -ForegroundColor Gray
    Remove-Item -Path $NextDevPath -Recurse -Force
}

Compress-Archive -Path "vien-ydh-frontend\.next", "vien-ydh-frontend\public", "vien-ydh-frontend\package.json", "vien-ydh-frontend\next.config.ts", "vien-ydh-frontend\messages" -DestinationPath $FrontendZip -Force

# ──────────────────────────────────────────────────────────────────────────
# BUOC 3: MAP O DIA MANG MAY CHU (MOUNT SMB SHARE)
# ──────────────────────────────────────────────────────────────────────────
Write-Host "`n3. Dang anh xa o dia mang may chu ao $ServerIP..." -ForegroundColor Cyan
if (Test-Path "Z:") {
    Write-Host "-> Dang giai phong o dia Z: cu..." -ForegroundColor Gray
    Remove-PSDrive -Name "Z" -Force | Out-Null
}

$PasswordSecure = ConvertTo-SecureString $ServerPass -AsPlainText -Force
$Credential = New-Object System.Management.Automation.PSCredential($ServerUser, $PasswordSecure)

try {
    New-PSDrive -Name "Z" -PSProvider "FileSystem" -Root "\\$ServerIP\C$" -Credential $Credential -Persist:$false | Out-Null
    Write-Host "-> Anh xa thanh cong o dia Z: toi C$ tren may chu $ServerIP." -ForegroundColor Green
} catch {
    Write-Error "Khong the ket noi o dia mang may chu ao $ServerIP! Vui long kiem tra lai dia chi IP, ket noi mang noi bo."
}

# Tao thu muc dich tren server
if (!(Test-Path $ServerDeployDir)) {
    New-Item -ItemType Directory -Path $ServerDeployDir | Out-Null
}

# ──────────────────────────────────────────────────────────────────────────
# BUOC 4: COPY GOI TIN ZIP LEN SERVER
# ──────────────────────────────────────────────────────────────────────────
Write-Host "`n4. Dang copy cac goi tin ZIP va tai nguyen len may chu..." -ForegroundColor Cyan
Copy-Item $BackendZip -Destination $ServerDeployDir -Force
Copy-Item $FrontendZip -Destination $ServerDeployDir -Force
Write-Host "-> Da copy backend.zip va frontend.zip len $ServerDeployDir." -ForegroundColor Green

# ──────────────────────────────────────────────────────────────────────────
# BUOC 5: TAO FILE SCRIPT HO TRO CAU HINH TU DONG TREN SERVER
# ──────────────────────────────────────────────────────────────────────────
Write-Host "`n5. Dang tao kich ban thiet lap tu dong tren may chu..." -ForegroundColor Cyan

$ServerSetupContent = @"
# ==========================================================================
# SCRIPT HO TRO TRIEN KHAI & THIET LAP WINDOWS SERVICES TREN SERVER
# CHI CAN CHAY TREN MAY CHU 192.168.1.34
# ==========================================================================
`$ErrorActionPreference = "Stop"
`$DeployDir = "C:\inetpub\wwwroot\vien-ydh-website"
`$NodeExe = (Get-Command node).Source

Write-Host "=== Bat dau thiet lap Windows Services tren Server ===" -ForegroundColor Green

# 1. Dung cac Windows Service cu neu dang chay
if (Get-Service -Name "VienYDHDT_API" -ErrorAction SilentlyContinue) {
    Write-Host "-> Dang dung dich vu Backend..."
    Stop-Service -Name "VienYDHDT_API" -Force
}
if (Get-Service -Name "VienYDHDT_WEB" -ErrorAction SilentlyContinue) {
    Write-Host "-> Dang dung dich vu Frontend..."
    Stop-Service -Name "VienYDHDT_WEB" -Force
}

# 2. Giai nen cac goi ZIP sach
Write-Host "-> Dang giai nen ma nguon moi..."
Expand-Archive -Path "`$DeployDir\backend.zip" -DestinationPath "`$DeployDir\backend" -Force
Expand-Archive -Path "`$DeployDir\frontend.zip" -DestinationPath "`$DeployDir\frontend" -Force

# 3. Cai dat cac package node_modules phuc vu Production
Write-Host "-> Dang cai dat thu vien dependencies cho Backend..."
Push-Location "`$DeployDir\backend"
npm install --omit=dev
Pop-Location

Write-Host "-> Dang cai dat thu vien dependencies cho Frontend..."
Push-Location "`$DeployDir\frontend"
npm install --omit=dev
Pop-Location

# 4. Thiet lap file cau hinh moi truong (.env)
Write-Host "-> Cap nhat cau hinh moi truong (.env) cho san xuat..."
if (!(Test-Path "`$DeployDir\backend\.env")) {
    @'
PORT=4000
NODE_ENV=production
DB_USER=system
DB_PASSWORD=hssmedi123a
DB_CONNECT_STRING=192.168.1.113:1521/medi
FRONTEND_URL=http://localhost:3000
'@ | Out-File -FilePath "`$DeployDir\backend\.env" -Encoding utf8
}

if (!(Test-Path "`$DeployDir\frontend\.env")) {
    @'
PORT=3000
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://192.168.1.34:5081/api
'@ | Out-File -FilePath "`$DeployDir\frontend\.env" -Encoding utf8
}

# 5. Dang ky Windows Services thong qua cong cu NSSM
Write-Host "-> Dang ky dich vu Windows ngam tu dong..."
if (!(Get-Command nssm -ErrorAction SilentlyContinue)) {
    Write-Warning "Khong tim thay NSSM trong PATH. Hay dam bao ban da tai nssm.exe va them vao PATH he thong."
    Write-Host "Duong dan cai dat thu cong:"
    Write-Host "nssm install VienYDHDT_API Node.exe \"`$DeployDir\backend\dist\index.js\""
    Write-Host "nssm install VienYDHDT_WEB Node.exe \"`$DeployDir\frontend\node_modules\next\dist\bin\next\" \"start\""
} else {
    # Dang ky Backend Service
    if (!(Get-Service -Name "VienYDHDT_API" -ErrorAction SilentlyContinue)) {
        nssm install VienYDHDT_API "`$NodeExe" "\"`$DeployDir\backend\dist\index.js\""
        nssm set VienYDHDT_API AppDirectory "`$DeployDir\backend"
        nssm set VienYDHDT_API DisplayName "Vien YDHDT - API Backend Service"
        nssm set VienYDHDT_API Start SERVICE_AUTO_START
        Write-Host "-> Da dang ky dich vu Backend: VienYDHDT_API" -ForegroundColor Green
    }
    
    # Dang ky Frontend Service
    if (!(Get-Service -Name "VienYDHDT_WEB" -ErrorAction SilentlyContinue)) {
        nssm install VienYDHDT_WEB "`$NodeExe" "\"`$DeployDir\frontend\node_modules\next\dist\bin\next\" start"
        nssm set VienYDHDT_WEB AppDirectory "`$DeployDir\frontend"
        nssm set VienYDHDT_WEB DisplayName "Vien YDHDT - Web Frontend Service"
        nssm set VienYDHDT_WEB Start SERVICE_AUTO_START
        Write-Host "-> Da dang ky dich vu Frontend: VienYDHDT_WEB" -ForegroundColor Green
    }
    
    # 6. Cau hinh IIS ARR de bao toan Host Header (tranh loi Next.js Server Action CSRF)
    Write-Host "-> Dang cau hinh IIS ARR preserveHostHeader..."
    try {
        $AppCmd = "`$env:windir\system32\inetsrv\appcmd.exe"
        if (Test-Path `$AppCmd) {
            & `$AppCmd set config -section:system.webServer/proxy /preserveHostHeader:"True" /commit:apphost
            Write-Host "-> Da bat preserveHostHeader trong IIS thanh cong." -ForegroundColor Green
        } else {
            Write-Warning "Khong tim thay appcmd.exe tai `$AppCmd. Khong the tu dong cau hinh IIS."
        }
        
        # Reset IIS de ap dung cau hinh moi
        Write-Host "-> Dang khoi dong lai IIS..."
        iisreset /noforce
        Write-Host "-> Da khoi dong lai IIS thanh cong." -ForegroundColor Green
    } catch {
        Write-Warning "Co loi khi cau hinh IIS: `$_"
    }

    # Khoi dong dich vu
    Start-Service -Name "VienYDHDT_API"
    Start-Service -Name "VienYDHDT_WEB"
    Write-Host "🚀 CA HAI DICH VU WINDOWS DA DUOC KHOI CHAY THANH CONG VA CHAY NGAM HE THONG!" -ForegroundColor Green
}

Write-Host "=== Hoan tat quy trinh thiet lap tren Server! ===" -ForegroundColor Green
"@ | Out-File -FilePath "$ServerDeployDir\server-setup.ps1" -Encoding utf8

Write-Host "-> Da tao kich ban thiet lap Z:\inetpub\wwwroot\vien-ydh-website\server-setup.ps1 thanh cong." -ForegroundColor Green

# Giai phong ket noi o dia mang ao
Remove-PSDrive -Name "Z" -Force | Out-Null

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "🎉 HOAN TAT TRUYEN TAI THANH CONG GOI TRIEN KHAI LEN SERVER!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "👉 Cac buoc tiep theo danh cho Quan tri vien:" -ForegroundColor Yellow
Write-Host "1. Dang nhap vao May chu ao 192.168.1.34." -ForegroundColor Yellow
Write-Host "2. Mo PowerShell voi quyen Administrator." -ForegroundColor Yellow
Write-Host "3. Di chuyen den thu muc C:\inetpub\wwwroot\vien-ydh-website" -ForegroundColor Yellow
Write-Host "4. Chay lenh: .\server-setup.ps1" -ForegroundColor Yellow
Write-Host "He thong se tu dong hoan tat 100% cong viec cai dat dich vu ngam!" -ForegroundColor Green
