$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $here
Write-Host 'Installing frontend dependencies...'
npm install
Write-Host 'Starting frontend...'
npm run dev
