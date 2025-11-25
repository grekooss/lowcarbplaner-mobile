@echo off
echo.
echo ========================================
echo   Przeladowanie aplikacji LowCarb Planer
echo ========================================
echo.

echo [1/3] Zatrzymywanie Expo...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Czyszczenie cache...
rmdir /s /q .expo >nul 2>&1
rmdir /s /q node_modules\.cache >nul 2>&1

echo [3/3] Uruchamianie Expo z czystym cache...
echo.
echo Aplikacja zostanie uruchomiona za chwile...
echo Po uruchomieniu nacisnij 'r' w terminalu aby przeladowac
echo.

call npm start -- --clear

echo.
echo Gotowe!
pause
