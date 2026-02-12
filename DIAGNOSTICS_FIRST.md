# Diagnostic Commands - Run First (NO CHANGES)

Run these commands to understand the current state. **These are READ-ONLY and safe.**

Copy the output and analyze before making any changes.

---

## 1. Check Node and Package Manager

```bash
# Node version
node -v

# NPM version
npm -v

# Check if using Yarn
yarn -v

# Check if using pnpm
pnpm -v
```

**Expected:** Should show version numbers. Note which package manager you're using.

---

## 2. Check Framework (Expo vs React Native)

```bash
# Is this an Expo project?
npx expo --version

# Or React Native CLI?
npx react-native --version
```

**Expected:** One of these should work. Note which framework you're using.

---

## 3. Check Problematic Packages

```bash
# Reanimated version
npm list react-native-reanimated

# Worklets version
npm list react-native-worklets-core

# Gesture handler (often related)
npm list react-native-gesture-handler

# React version
npm list react

# React Native version
npm list react-native
```

**Look for:**
- Version numbers of each package
- Any "UNMET DEPENDENCY" warnings
- Duplicate versions (bad sign)
- Empty result (package not installed)

---

## 4. Check Full Dependency Tree

```bash
# See all dependencies and conflicts
npm ls 2>&1 | tee dependency-tree.txt
```

**Look for:**
- Lines with "invalid" or "missing"
- UNMET PEER DEPENDENCY warnings
- Multiple versions of same package

---

## 5. Check Project Files

```bash
# Does babel.config.js exist?
cat babel.config.js

# Does metro.config.js exist?
cat metro.config.js

# Check package.json scripts
cat package.json | grep -A 20 '"scripts"'

# Check if using Expo
cat app.json
```

**Look for:**
- babel.config.js must exist and have reanimated plugin
- Note your start script name
- Note if using Expo Go or development build

---

## 6. Check for Lock Files

```bash
# Which lock file exists?
ls -la | grep -E "(package-lock.json|yarn.lock|pnpm-lock.yaml)"

# Check for multiple lock files (problematic)
ls -la | grep -E "lock"
```

**Expected:** Should have ONLY ONE lock file (not multiple)

---

## 7. Check Cache Locations

```bash
# Metro cache
ls -la /tmp/metro-* 2>/dev/null || echo "No Metro cache"

# Expo cache (if using Expo)
ls -la .expo 2>/dev/null || echo "No .expo directory"

# Node modules
du -sh node_modules 2>/dev/null || echo "No node_modules"
```

**This shows:** What caches exist and their sizes

---

## 8. Check Git Status

```bash
# What files have uncommitted changes?
git status

# What was the last commit?
git log -1 --oneline

# Are there any stashed changes?
git stash list
```

**Important:** Make sure you can rollback if needed

---

## 9. Capture Current Error

```bash
# Start the app and capture logs
npm start 2>&1 | tee app-startup-log.txt
# Let it run until error appears, then Ctrl+C
```

**This creates:** A log file with the exact error for reference

---

## Output Analysis Template

Once you've run all commands, fill this out:

```
=== DIAGNOSTIC REPORT ===

Node Version: _______________
Package Manager: _______________ (npm/yarn/pnpm)
Framework: _______________ (Expo/React Native CLI)

React Version: _______________
React Native Version: _______________
Expo SDK Version: _______________ (if Expo)

react-native-reanimated: _______________
react-native-worklets-core: _______________

Babel Plugin Present: _______________ (yes/no)
Babel Plugin Position: _______________ (last/not last/absent)

Lock Files Found: _______________
Multiple Lock Files: _______________ (yes/no - BAD if yes)

Unmet Dependencies: _______________
Peer Dependency Warnings: _______________

Git Status: _______________ (clean/uncommitted changes)
Last Commit: _______________

Error Message (exact):
_______________
_______________
_______________
```

---

## Decision Based on Diagnostics

After filling out the report, you should know:

1. **If babel plugin missing/wrong position** → Fix babel.config.js (Step 4)
2. **If cache exists** → Clear caches first (Step 3)
3. **If versions clearly mismatched** → Reinstall node_modules (Step 5)
4. **If multiple lock files** → Delete extras, keep one
5. **If unmet dependencies** → May need version alignment (Step 6)

---

## Share This Report

If the problem isn't clear, share the filled-out diagnostic report for further analysis before making changes.

**Remember:** These commands don't modify anything. Run them all safely.
