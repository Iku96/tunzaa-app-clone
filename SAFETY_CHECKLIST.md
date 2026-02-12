# Quick Safety Checklist for AI Agent

Print this out or keep it visible while executing the fix.

## Before Starting ANY Changes

- [ ] Git commit created with message "BACKUP: Before fixing worklets"
- [ ] package.json.backup created
- [ ] Current versions documented in versions_backup.txt
- [ ] App currently builds (even if it shows error)
- [ ] Note: At least X screens are working: _____________

## After EACH Step

- [ ] App still builds without new errors
- [ ] No new crashes
- [ ] Existing working features still work
- [ ] If broken: STOPPED and documented what broke

## Red Flags - STOP IMMEDIATELY If You See:

🛑 **STOP if any of these happen:**
- Build fails completely (can't compile)
- App crashes on launch (not just error screen)
- Existing screens suddenly broken
- New errors about React, React Native, or Expo versions
- Terminal shows "BREAKING CHANGES" or "incompatible"
- Peer dependency errors multiply

## Safe vs Risky Actions

### ✅ SAFE (Low Risk):
- Clearing caches (Metro, watchman, Expo)
- Checking babel.config.js (just looking)
- Running `npm list` to check versions
- Creating backups
- Testing the app

### ⚠️ MEDIUM RISK (Proceed with caution):
- Modifying babel.config.js
- Deleting node_modules and reinstalling
- Running `npx expo install --fix`
- Updating single specific package

### 🛑 HIGH RISK (Only if explicitly instructed):
- Updating React or React Native version
- Updating Expo SDK version
- Changing multiple packages at once
- Modifying native code (ios/, android/)
- Ejecting from Expo

## Rollback Command (If Things Break)

**Immediate rollback to safety:**
```bash
git restore .
git clean -fd
rm -rf node_modules
npm install
```

## Decision Tree

```
Does app build?
├─ NO → Use git rollback, report error
└─ YES → Continue to next step

Does worklets error still show?
├─ NO → STOP, you're done! ✅
└─ YES → Continue to next step

Are existing screens working?
├─ NO → Rollback, something broke
└─ YES → Safe to continue
```

## Questions to Ask Yourself

Before each command:
1. "What will this command do?"
2. "Can I undo this if it breaks?"
3. "Have I backed up first?"
4. "Do I understand why I'm running this?"

If you answer "no" or "unsure" to any: **STOP and ask for clarification**

## Test Script (Run After Each Change)

```bash
# 1. Does it build?
npm start
# Wait for "Bundling complete"

# 2. Does it launch?
# Open on simulator/device
# Check for crash or error

# 3. Do screens work?
# Navigate to UserTypeSelection
# Navigate to other known-working screens
# Check console for errors

# 4. Is worklets error gone?
# Check the red error screen
# Should not see "Mismatch between JavaScript part and native part"
```

## Success = All These True

- [x] App builds successfully
- [x] App launches without crash
- [x] Worklets error is gone
- [x] UserTypeSelection screen loads
- [x] Previously working screens still work
- [x] No new errors in console

---

**Remember:** 
- Safety first, speed second
- Test after EACH change
- Document what you try
- Stop if unsure
- Better to ask than to break the app
