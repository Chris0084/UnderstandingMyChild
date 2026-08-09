run build app to use on VM: npx expo run:android

building a release
ensure you bump the version in app.json
run: eas build --platform android --profile production
run: eas build --platform ios --auto-submit
