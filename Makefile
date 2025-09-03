.PHONY: gradle
gradle:
	@bash ./.gradlew-ensure >/dev/null 2>&1 || true
	@chmod +x ./gradlew || true
	@./gradlew assembleDebug || true
