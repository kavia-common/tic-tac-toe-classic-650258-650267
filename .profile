# Ensure gradle wrapper exists for CI shells that source .profile
if [ ! -f "./gradlew" ]; then
  if [ -f "./.ci-init.sh" ]; then
    bash ./.ci-init.sh >/dev/null 2>&1 || true
  fi
fi
