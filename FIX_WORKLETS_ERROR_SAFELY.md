# AI Agent Prompt: Fix react-native-worklets Version Mismatch Error

## Problem Statement
The app shows this error when loading:
```
[Worklets] Mismatch between JavaScript part and native part of Worklets!
(0.7.2 vs 0.5.1)
```

This is preventing the UserTypeSelection screen (and likely other screens) from loading.

## CRITICAL SAFETY REQUIREMENTS

⚠️ **BEFORE YOU START - CREATE SAFETY CHECKPOINT:**

1. **DO NOT make any changes until you've completed these safety steps:**
   - Create a git commit with current working state
   - Document current package versions
   - Take note of which screens/features are currently working
   - Verify the app builds and runs (even with the error)

2. **AFTER EACH STEP:**
   - Test that the app still builds
   - Check that existing screens still work
   - If anything breaks, STOP and document what broke
   - Only proceed to next step if current state is stable

3. **NEVER:**
   - Update major versions of React, React Native, or Expo without explicit instruction
   - Delete files without backing them up first
   - Modify working screens or components
   - Change navigation structure
   - Update all dependencies at once

## Step-by-Step Solution (Execute Carefully)

### STEP 1: Safety Backup (MANDATORY)
```bash
# Create a git commit of current state
git add .
git commit -m "BACKUP: Before fixing worklets version mismatch"

# Document current versions
npm list react-native-reanimated > versions_backup.txt
npm list react-native-worklets-core >> versions_backup.txt
npm list expo >> versions_backup.txt

# Save current package.json
cp package.json package.json.backup
```

**Checkpoint:** Verify backup was created successfully

---

### STEP 2: Investigate Current State
```bash
# Check what versions are actually installed
npm list react-native-reanimated
npm list react-native-worklets-core
npm list react-native-gesture-handler

# Check for peer dependency warnings
npm ls
```

**What to look for:**
- Version numbers of react-native-reanimated
- Any UNMET PEER DEPENDENCY warnings
- Conflicting versions in the dependency tree

**Checkpoint:** Document findings before proceeding

---

### STEP 3: Clear Caches (Low Risk)
This step is safe and won't break anything:

```bash
# Clear Metro bundler cache
rm -rf /tmp/metro-*

# Clear watchman cache
watchman watch-del-all

# Clear Expo cache (if using Expo)
npx expo start --clear

# Or for React Native CLI
npx react-native start --reset-cache
```

**Test:** Try running the app again. Does the error still appear?
- ✅ If error is gone: STOP HERE, problem solved
- ❌ If error persists: Continue to Step 4

---

### STEP 4: Check babel.config.js (Low Risk)
**Look at** (don't modify yet) your `babel.config.js`

**Required configuration:**
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // or 'module:metro-react-native-babel-preset'
    plugins: [
      // ... your other plugins
      'react-native-reanimated/plugin', // MUST be LAST
    ],
  };
};
```

**Action Items:**
- Is `react-native-reanimated/plugin` present?
- Is it the LAST plugin in the array?
- Are there any syntax errors?

**If changes needed:**
1. Make backup: `cp babel.config.js babel.config.js.backup`
2. Make ONLY the minimal required changes
3. Test immediately after

**Checkpoint:** Babel config is correct and app still builds

---

### STEP 5: Reinstall node_modules (Medium Risk)

⚠️ **BEFORE DOING THIS:** 
- Ensure Step 1 backup is complete
- Ensure package.json.backup exists
- Note your current Node version: `node -v`

```bash
# Delete node_modules and lock file
rm -rf node_modules
rm package-lock.json  # or yarn.lock or pnpm-lock.yaml

# Reinstall with EXACT same package.json
npm install  # or yarn / pnpm install

# For iOS native dependencies (if on macOS)
cd ios && pod install && cd ..
```

**Test immediately:**
```bash
# Try to build and run
npx expo start --clear  # or npm start

# If build fails, rollback:
git restore package-lock.json
rm -rf node_modules
npm install
```

**Checkpoint:** App builds successfully, test on device/simulator

---

### STEP 6: Version Alignment (Higher Risk - Only if Step 5 Failed)

⚠️ **ONLY DO THIS IF:**
- Steps 1-5 didn't fix the issue
- You've confirmed backups are in place
- The app currently builds (even with the error)

**Option A: Use Expo's auto-fix (Safest for Expo projects)**
```bash
npx expo install --fix
npx expo install react-native-reanimated
```

**Option B: Manual version check (for specific conflicts)**
```bash
# Check what Expo/RN version expects
npx expo-doctor

# Or check compatibility
npm info react-native-reanimated peerDependencies
```

**Test after EACH package update:**
```bash
npm install
npx expo start --clear
# Verify app loads
```

**If something breaks:**
```bash
# Immediate rollback
git restore package.json package-lock.json
rm -rf node_modules
npm install
```

**Checkpoint:** App works with updated dependencies

---

### STEP 7: Final Verification

Test these specific things:
- [ ] App launches without worklets error
- [ ] UserTypeSelection screen loads
- [ ] Other screens that were working still work
- [ ] Animations/gestures work (if you have any)
- [ ] No new errors in console
- [ ] App doesn't crash on navigation

---

## Rollback Instructions (If Anything Breaks)

### Quick Rollback:
```bash
git restore .
git clean -fd
npm install
cd ios && pod install && cd ..  # if iOS
```

### Full Rollback:
```bash
# Go back to backup commit
git reset --hard HEAD~1

# Reinstall from backup
rm -rf node_modules
npm install
```

---

## What NOT to Do

❌ **DO NOT:**
- Update React Native or Expo major versions
- Update React version
- Delete or modify existing screen components
- Change package.json manually without testing
- Update multiple packages at once
- Skip the safety backup steps
- Continue if builds start failing

✅ **DO:**
- Test after EACH step
- Keep backups of everything
- Document what works and what doesn't
- Stop if you're unsure
- Ask for clarification before risky operations

---

## Success Criteria

✅ **The fix is successful when:**
1. App launches without the worklets error
2. UserTypeSelection screen loads properly
3. All previously working screens still work
4. No new errors appear
5. App can be built for production

---

## If This Doesn't Work

**Report back with:**
1. Which step you got to
2. Exact error messages
3. Output of `npm list react-native-reanimated`
4. Output of `npm list react-native-worklets-core`
5. Whether you're using Expo or React Native CLI
6. Your React Native/Expo version

**DO NOT:**
- Try random fixes from the internet
- Update more packages
- Modify native code
- Make destructive changes

---

## Context for Your Investigation

**Why this error happens:**
- react-native-reanimated uses worklets for animations
- The JavaScript bundle and native binary must be the same version
- Cached builds can have old native binaries even after npm install
- This is why clearing caches + reinstalling usually fixes it

**Common causes:**
1. Stale Metro bundler cache
2. Old compiled native modules in node_modules
3. Mismatch between package.json and what's actually installed
4. Missing or incorrectly positioned babel plugin
5. iOS pods not updated after dependency changes

**The safest fix order:**
Cache clear → Babel config → Reinstall node_modules → Version check

Only escalate to version changes if the safer options don't work.
