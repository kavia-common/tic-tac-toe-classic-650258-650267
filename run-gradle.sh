#!/usr/bin/env bash
set -e
# Ensure root shim is present and executable
if [ ! -f "./gradlew" ]; then
  echo "Root gradlew not found. Bootstrapping..."
  if [ -f "./gradle-bootstrap.sh" ]; then
    bash ./gradle-bootstrap.sh "$@"
    exit $?
  else
    # Create a minimal shim on the fly
    cat > "./gradlew" << 'EOF'
#!/usr/bin/env bash
set -e
WRAPPER="tic_tac_toe_frontend/android/gradlew"
if [ ! -f "$WRAPPER" ]; then
  echo "Gradle wrapper not found at $WRAPPER"
  exit 0
fi
chmod +x "$WRAPPER" || true
exec "$WRAPPER" "$@"
EOF
    chmod +x ./gradlew || true
  fi
fi

chmod +x ./gradlew || true
exec ./gradlew "$@"
