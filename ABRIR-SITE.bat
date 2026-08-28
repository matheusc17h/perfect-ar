@echo off
title Perfect Ar - site local
cd /d "%~dp0"

if not exist "dist\index.html" (
  echo.
  echo  A pasta "dist" nao existe ainda.
  echo  Abra o PowerShell nesta pasta e rode:  npm install  e depois  npm run build
  echo.
  pause
  exit /b 1
)

echo.
echo   ====================================================
echo    PERFECT AR - site rodando localmente
echo    Endereco:  http://localhost:8080
echo    Para FECHAR o site: feche esta janela preta.
echo   ====================================================
echo.

start "" "http://localhost:8080"

where python >/dev/null 2>/dev/null && ( python -m http.server 8080 --directory dist & goto :eof )
where py >/dev/null 2>/dev/null && ( py -m http.server 8080 --directory dist & goto :eof )
where npx >/dev/null 2>/dev/null && ( npx --yes serve -l 8080 dist & goto :eof )

echo Nao encontrei Python nem Node para iniciar o servidor.
pause
