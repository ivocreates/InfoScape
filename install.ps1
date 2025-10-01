# InfoScope OSINT Platform v2.0.0 - Windows Installation Script
# PowerShell automated installation with dependency checks

param(
    [string]$InstallPath = "$env:LOCALAPPDATA\InfoScope OSINT",
    [switch]$Silent = $false,
    [switch]$PortableMode = $false
)

# Colors for console output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

# Logo
function Show-Logo {
    Write-Host ""
    Write-Host "${Blue}  ___        __       ____                       " -NoNewline
    Write-Host "${Blue} |_ _|_ __  / _| ___  / ___|  ___ ___  _ __   ___  " -NoNewline
    Write-Host "${Blue}  | || '_ \| |_ / _ \| |     / __/ _ \| '_ \ / _ \ " -NoNewline
    Write-Host "${Blue}  | || | | |  _| (_) | |___ | (_| (_) | |_) |  __/ " -NoNewline
    Write-Host "${Blue} |___|_| |_|_|  \___/ \____| \___\___/| .__/ \___| " -NoNewline
    Write-Host "${Blue}                                     |_|          ${Reset}"
    Write-Host ""
    Write-Host "${Green}Professional OSINT Investigation Platform v2.0.0${Reset}"
    Write-Host "${Blue}===========================================${Reset}"
    Write-Host ""
}

# Logging functions
function Write-Status {
    param([string]$Message)
    Write-Host "${Green}[INFO]${Reset} $Message"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "${Yellow}[WARN]${Reset} $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "${Red}[ERROR]${Reset} $Message"
}

# Check system requirements
function Test-SystemRequirements {
    Write-Status "Checking system requirements..."
    
    # Check Windows version
    $winVersion = [System.Environment]::OSVersion.Version
    if ($winVersion.Major -lt 10) {
        Write-Error "Windows 10 or later is required. Current version: $($winVersion.ToString())"
        return $false
    }
    
    Write-Status "Windows version: $($winVersion.ToString()) ✓"
    
    # Check available disk space (1GB minimum)
    $drive = Get-PSDrive -Name C
    $freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
    
    if ($freeSpaceGB -lt 1) {
        Write-Error "Insufficient disk space. Available: ${freeSpaceGB}GB, Required: 1GB"
        return $false
    }
    
    Write-Status "Available disk space: ${freeSpaceGB}GB ✓"
    
    # Check PowerShell execution policy
    $policy = Get-ExecutionPolicy
    if ($policy -eq "Restricted") {
        Write-Warning "PowerShell execution policy is Restricted. You may need to run: Set-ExecutionPolicy RemoteSigned"
    }
    
    return $true
}

# Download function with progress
function Invoke-FileDownload {
    param(
        [string]$Url,
        [string]$OutputPath
    )
    
    try {
        Write-Status "Downloading from: $Url"
        $webClient = New-Object System.Net.WebClient
        
        # Progress handler
        $webClient.DownloadProgressChanged += {
            param($sender, $e)
            $percent = $e.ProgressPercentage
            Write-Progress -Activity "Downloading InfoScope OSINT" -Status "$percent% Complete" -PercentComplete $percent
        }
        
        $webClient.DownloadFile($Url, $OutputPath)
        Write-Progress -Activity "Downloading InfoScope OSINT" -Completed
        Write-Status "Download completed: $OutputPath"
        return $true
    }
    catch {
        Write-Error "Download failed: $($_.Exception.Message)"
        return $false
    }
    finally {
        if ($webClient) { $webClient.Dispose() }
    }
}

# Installation function
function Install-InfoScope {
    $downloadUrl = "https://github.com/ivocreates/InfoScape/releases/download/v2.0.0/InfoScope-OSINT-2.0.0-Setup.exe"
    $installerPath = "$env:TEMP\InfoScope-OSINT-2.0.0-Setup.exe"
    
    Write-Status "Starting InfoScope OSINT Platform installation..."
    
    # Download installer
    if (-not (Invoke-FileDownload -Url $downloadUrl -OutputPath $installerPath)) {
        Write-Error "Failed to download installer"
        return $false
    }
    
    # Verify file exists and has reasonable size
    if (-not (Test-Path $installerPath)) {
        Write-Error "Installer file not found after download"
        return $false
    }
    
    $fileSize = (Get-Item $installerPath).Length
    if ($fileSize -lt 10MB) {
        Write-Error "Downloaded file appears to be corrupt (size: $fileSize bytes)"
        return $false
    }
    
    Write-Status "Installer size: $([math]::Round($fileSize / 1MB, 2))MB"
    
    # Run installer
    try {
        if ($Silent) {
            Write-Status "Running silent installation..."
            $process = Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait -PassThru
        } else {
            Write-Status "Running interactive installation..."
            $process = Start-Process -FilePath $installerPath -Wait -PassThru
        }
        
        if ($process.ExitCode -eq 0) {
            Write-Status "Installation completed successfully!"
            return $true
        } else {
            Write-Error "Installation failed with exit code: $($process.ExitCode)"
            return $false
        }
    }
    catch {
        Write-Error "Failed to run installer: $($_.Exception.Message)"
        return $false
    }
    finally {
        # Cleanup
        if (Test-Path $installerPath) {
            Remove-Item $installerPath -Force
        }
    }
}

# Setup environment configuration
function Set-EnvironmentConfig {
    Write-Status "Setting up environment configuration..."
    
    $configDir = "$env:APPDATA\InfoScope OSINT"
    if (-not (Test-Path $configDir)) {
        New-Item -Path $configDir -ItemType Directory -Force | Out-Null
    }
    
    $envExamplePath = "$configDir\.env.example"
    
    $envContent = @"
# InfoScope OSINT Platform - Environment Configuration
# Copy this file to .env and add your actual API keys

# Google AI API Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# OpenAI API Configuration  
OPENAI_API_KEY=your_openai_api_key_here

# Firebase Configuration (optional for cloud sync)
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_PROJECT_ID=your_project_id

# Application Settings
GENERATE_SOURCEMAP=false
REACT_APP_ENVIRONMENT=production
"@
    
    Set-Content -Path $envExamplePath -Value $envContent
    Write-Status "Configuration template created at: $envExamplePath"
    Write-Warning "Remember to configure your API keys for full functionality!"
}

# Check for recommended tools
function Test-RecommendedTools {
    Write-Status "Checking for recommended security tools..."
    
    $tools = @(
        @{Name="tor"; Description="Tor Browser for anonymous browsing"},
        @{Name="nmap"; Description="Network scanning and discovery"},
        @{Name="whois"; Description="Domain registration information"},
        @{Name="nslookup"; Description="DNS lookup utility"}
    )
    
    foreach ($tool in $tools) {
        try {
            $null = Get-Command $tool.Name -ErrorAction Stop
            Write-Status "✓ $($tool.Name) is available"
        }
        catch {
            Write-Warning "○ $($tool.Name) is not installed - $($tool.Description)"
        }
    }
}

# Create desktop shortcut
function New-DesktopShortcut {
    try {
        $shortcutPath = "$env:USERPROFILE\Desktop\InfoScope OSINT.lnk"
        $targetPath = "$env:LOCALAPPDATA\Programs\InfoScope OSINT Platform\InfoScope OSINT Platform.exe"
        
        if (Test-Path $targetPath) {
            $WshShell = New-Object -comObject WScript.Shell
            $Shortcut = $WshShell.CreateShortcut($shortcutPath)
            $Shortcut.TargetPath = $targetPath
            $Shortcut.Description = "Professional OSINT Investigation Platform"
            $Shortcut.Save()
            Write-Status "Desktop shortcut created"
        }
    }
    catch {
        Write-Warning "Could not create desktop shortcut: $($_.Exception.Message)"
    }
}

# Post-installation tasks
function Complete-PostInstall {
    Write-Status "Running post-installation setup..."
    
    Set-EnvironmentConfig
    Test-RecommendedTools
    New-DesktopShortcut
    
    Write-Host ""
    Write-Status "Installation completed successfully!"
    Write-Host ""
    Write-Host "${Blue}Next Steps:${Reset}"
    Write-Host "1. Launch InfoScope OSINT from Start Menu or Desktop"
    Write-Host "2. Configure API keys in the settings"
    Write-Host "3. Review legal documentation and terms"
    Write-Host "4. Start your first OSINT investigation"
    Write-Host ""
    Write-Host "${Blue}Resources:${Reset}"
    Write-Host "• Documentation: https://github.com/ivocreates/InfoScape/wiki"
    Write-Host "• Web Version: https://infoscope-osint.web.app"
    Write-Host "• Community: https://github.com/ivocreates/InfoScape/discussions"
    Write-Host ""
    Write-Host "${Green}Happy investigating! 🕵️${Reset}"
}

# Main installation function
function Start-Installation {
    Show-Logo
    
    if (-not $Silent) {
        $confirmation = Read-Host "Do you want to continue with the installation? [Y/n]"
        if ($confirmation -and $confirmation.ToLower() -ne "y" -and $confirmation.ToLower() -ne "yes") {
            Write-Status "Installation cancelled."
            return
        }
    }
    
    if (-not (Test-SystemRequirements)) {
        Write-Error "System requirements not met. Installation aborted."
        return
    }
    
    if (Install-InfoScope) {
        Complete-PostInstall
    } else {
        Write-Error "Installation failed. Please check the error messages above."
    }
}

# Run the installation
Start-Installation