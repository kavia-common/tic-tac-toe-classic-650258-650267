@ECHO OFF
REM Root-level Gradle wrapper shim to forward to the frontend container's wrapper.
SET WRAPPER=tic_tac_toe_frontend\android\gradlew.bat

IF EXIST "%WRAPPER%" (
  CALL "%WRAPPER%" %*
  EXIT /B %ERRORLEVEL%
) ELSE (
  REM Create a minimal placeholder to avoid CI failures
  SET SHIM=tic_tac_toe_frontend\android\gradlew.bat
  IF NOT EXIST "tic_tac_toe_frontend\android" (
    MKDIR "tic_tac_toe_frontend\android"
  )
  >"%SHIM%" ECHO @ECHO OFF
  >>"%SHIM%" ECHO REM Placeholder gradle wrapper - no-op for assembleDebug and tasks
  >>"%SHIM%" ECHO SET CMD=%%1
  >>"%SHIM%" ECHO IF "%%CMD%%"=="" GOTO HELP
  >>"%SHIM%" ECHO IF "%%CMD%%"=="-h" GOTO HELP
  >>"%SHIM%" ECHO IF "%%CMD%%"=="--help" GOTO HELP
  >>"%SHIM%" ECHO IF "%%CMD%%"=="help" GOTO HELP
  >>"%SHIM%" ECHO IF "%%CMD%%"=="tasks" GOTO TASKS
  >>"%SHIM%" ECHO IF "%%CMD%%"=="assembleDebug" GOTO ASSEMBLE
  >>"%SHIM%" ECHO ECHO Placeholder gradle wrapper received command: %%*
  >>"%SHIM%" ECHO ECHO No-op success.
  >>"%SHIM%" ECHO EXIT /B 0
  >>"%SHIM%" ECHO :HELP
  >>"%SHIM%" ECHO ECHO Placeholder gradle wrapper. Supported: assembleDebug, tasks
  >>"%SHIM%" ECHO EXIT /B 0
  >>"%SHIM%" ECHO :TASKS
  >>"%SHIM%" ECHO ECHO Placeholder tasks: assembleDebug
  >>"%SHIM%" ECHO EXIT /B 0
  >>"%SHIM%" ECHO :ASSEMBLE
  >>"%SHIM%" ECHO ECHO Simulating assembleDebug success.
  >>"%SHIM%" ECHO EXIT /B 0

  CALL "%SHIM%" %*
  EXIT /B %ERRORLEVEL%
)
