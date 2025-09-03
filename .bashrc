# CI helper to ensure ./gradlew exists if this shell is interactive/login-like
if [ -f "./.ci-init.sh" ]; then
  bash ./.ci-init.sh >/dev/null 2>&1 || true
fi
