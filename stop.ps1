# AI Marketplace - PowerShell Dev Stopper
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir
node "$ScriptDir\scripts\stop-all.mjs" @args
