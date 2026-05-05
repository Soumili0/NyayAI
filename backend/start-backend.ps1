$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $here
Write-Host 'Installing backend dependencies...'
pip install -r requirements.txt
Write-Host 'Starting backend...'
python app.py
