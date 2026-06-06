#!/bin/zsh
set -u

cd "/Users/jaden15/贤仔烧腊 - Code /xianzaishoala" || exit 1

echo "Roast by Jaden website updater"
echo "================================"
echo ""

echo "Checking website files..."
git add index.html app.js styles.css vercel.json assets 2>/dev/null

if ! git diff --cached --quiet; then
  MESSAGE="Update website $(date '+%Y-%m-%d %H:%M')"
  echo "Saving changes: $MESSAGE"
  git commit -m "$MESSAGE"
  if [ "$?" -ne 0 ]; then
    echo ""
    echo "Could not save changes. Please check the message above."
    echo "Press Enter to close."
    read
    exit 1
  fi
else
  echo "No unsaved website file changes."
fi

echo ""
echo "Local status:"
git status -sb

echo ""
echo "Uploading latest version to GitHub..."
git push origin main
PUSH_RESULT=$?

echo ""
if [ "$PUSH_RESULT" -eq 0 ]; then
  echo "Upload complete."
  echo "Vercel should update the live website in 1-3 minutes."
  echo "Open: https://roastbyjaden.vercel.app/?fresh=$(date +%s)"
else
  echo "Upload failed."
  echo "Please make sure this Mac can open GitHub and that GitHub is logged in."
  echo "Then run this file again."
fi

echo ""
echo "Press Enter to close."
read
