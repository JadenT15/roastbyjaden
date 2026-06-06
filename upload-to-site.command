#!/bin/zsh
cd "/Users/jaden15/贤仔烧腊 - Code /xianzaishoala" || exit 1

echo "Uploading Roast by Jaden website updates to GitHub..."
echo ""

git push origin main
RESULT=$?

echo ""
if [ "$RESULT" -eq 0 ]; then
  echo "Upload complete. Vercel should update the website in 1-3 minutes."
else
  echo "Upload failed. Make sure GitHub opens on this Mac and you are logged in."
  echo "If GitHub asks you to log in, finish login and run this file again."
fi

echo ""
echo "Press Enter to close this window."
read
