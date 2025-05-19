@echo off
REM Create base directories
mkdir app\auth
mkdir app\models
mkdir app\routers
mkdir app\services
mkdir app\utils
mkdir tests

REM Create base files
echo.> app\__init__.py
echo.> app\main.py
echo.> app\config.py
echo.> app\dependencies.py

REM Auth module files
echo.> app\auth\__init__.py
echo.> app\auth\router.py
echo.> app\auth\oauth.py
echo.> app\auth\jwt.py
echo.> app\auth\utils.py

REM Models module files
echo.> app\models\__init__.py
echo.> app\models\user.py
echo.> app\models\resume.py
echo.> app\models\subscription.py
echo.> app\models\token.py
echo.> app\models\activity.py
echo.> app\models\resume_check.py
echo.> app\models\roadmap.py
echo.> app\models\notification.py

REM Routers module files
echo.> app\routers\__init__.py
echo.> app\routers\users.py
echo.> app\routers\resumes.py
echo.> app\routers\subscriptions.py
echo.> app\routers\tokens.py
echo.> app\routers\resume_checker.py
echo.> app\routers\resume_extractor.py
echo.> app\routers\resume_builder.py
echo.> app\routers\roadmap.py
echo.> app\routers\fake_detector.py
echo.> app\routers\business_connect.py

REM Services module files
echo.> app\services\__init__.py
echo.> app\services\pdf_service.py
echo.> app\services\ai_service.py
echo.> app\services\email_service.py
echo.> app\services\payment_service.py

REM Utils module files
echo.> app\utils\__init__.py
echo.> app\utils\security.py
echo.> app\utils\helpers.py

REM Tests files
echo.> tests\__init__.py
echo.> tests\conftest.py
echo.> tests\test_auth.py
echo.> tests\test_resumes.py

echo Project structure created successfully.
