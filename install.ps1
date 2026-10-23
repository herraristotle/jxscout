<#
.SYNOPSIS
  jxscout installer for Windows.
.EXAMPLE
  irm https://raw.githubusercontent.com/herraristotle/jxscout/main/install.ps1 | iex
#>
[CmdletBinding()]
param(
  [string]$Version = $(if ($env:JXSCOUT_VERSION) { $env:JXSCOUT_VERSION } else { 'latest' }),
  [string]$InstallDir = $(if ($env:JXSCOUT_INSTALL_DIR) { $env:JXSCOUT_INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA 'jxscout\bin' })
)

$ErrorActionPreference = 'Stop'
$repo = if ($env:JXSCOUT_REPO) { $env:JXSCOUT_REPO } else { 'herraristotle/jxscout' }

$arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'amd64' }

if ($Version -eq 'latest') {
  $rel = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases/latest" -Headers @{ 'User-Agent' = 'jxscout-installer' }
  $Version = $rel.tag_name.TrimStart('v')
  $base = "https://github.com/$repo/releases/download/v$Version"
} else {
  $Version = $Version.TrimStart('v')
  $base = "https://github.com/$repo/releases/download/v$Version"
}

$archive = "jxscout_${Version}_windows_${arch}.zip"
$tmp = Join-Path ([IO.Path]::GetTempPath()) ("jxscout-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $tmp | Out-Null

try {
  Write-Host "downloading $archive"
  Invoke-WebRequest -Uri "$base/$archive" -OutFile (Join-Path $tmp $archive)

  $suffix = if ($arch -eq 'arm64') { 'arm64' } else { 'amd64' }
  try {
    Invoke-WebRequest -Uri "$base/jxscout-windows-checksums.txt" -OutFile (Join-Path $tmp 'checksums.txt')
    $want = (Get-Content (Join-Path $tmp 'checksums.txt') | Where-Object { $_ -match [regex]::Escape($archive) }) -replace '\s.*$', ''
    $got = (Get-FileHash -Algorithm SHA256 (Join-Path $tmp $archive)).Hash.ToLower()
    if ($want -and $want.ToLower() -ne $got) { throw 'checksum verification failed' }
  } catch {
    if ($_.Exception.Message -eq 'checksum verification failed') { throw }
    Write-Warning 'checksums not found, skipping verification'
  }

  Expand-Archive -Path (Join-Path $tmp $archive) -DestinationPath $tmp
  New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
  $exe = Get-ChildItem -Path $tmp -Filter jxscout.exe -Recurse | Select-Object -First 1
  if (-not $exe) { throw 'jxscout.exe not found in archive' }
  Copy-Item $exe.FullName (Join-Path $InstallDir 'jxscout.exe') -Force

  Write-Host "installed $(Join-Path $InstallDir 'jxscout.exe')"
  $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  if ($userPath -notlike "*$InstallDir*") {
    [Environment]::SetEnvironmentVariable('Path', "$userPath;$InstallDir", 'User')
    Write-Host "added $InstallDir to user PATH (restart your shell)"
  }
} finally {
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}
