# AI Marketplace - PowerShell Dev Launcher
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir
node "$ScriptDir\scripts\run-all.mjs" @args
