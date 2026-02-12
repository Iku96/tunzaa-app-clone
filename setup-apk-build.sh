#!/bin/bash
# APK Build Setup Script for Tunzaa App
# Run this in your WSL terminal

echo "🚀 Tunzaa APK Build Setup"
echo "=========================="
echo ""

# Step 1: Install EAS CLI
echo "📦 Step 1: Installing EAS CLI globally..."
npm install -g eas-cli

if [ $? -eq 0 ]; then
    echo "✅ EAS CLI installed successfully!"
else
    echo "❌ Failed to install EAS CLI"
    exit 1
fi

echo ""
echo "=========================="
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Run: eas login"
echo "2. Run: eas build -p android --profile preview"
echo "3. Wait ~15 mins for build"
echo "4. Download APK from link provided"
echo ""
echo "See apk_build_guide.md for full details!"
