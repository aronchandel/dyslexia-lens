# ✅ Pre-Push Checklist

Before pushing to your new GitHub repository, make sure:

## 🔐 Security Check
- [ ] `serviceAccountKey.json` is NOT in the project (check `server/src/config/`)
- [ ] `.env` files contain NO real passwords or API keys
- [ ] `.gitignore` includes all sensitive files
- [ ] Run: `git status` to verify no sensitive files will be committed

## 🧹 Clean Up
- [ ] Delete `node_modules/` folders:
  ```bash
  rm -rf client/node_modules server/node_modules
  ```
- [ ] Delete `venv/` folder:
  ```bash
  rm -rf ai-engine/venv
  ```
- [ ] Delete any test data or personal information

## 📝 Update README
- [ ] Add your Figma design link
- [ ] Replace `YOUR_USERNAME` with `abhijeet586`
- [ ] Add your name and LinkedIn profile
- [ ] Remove the extra "# dyslexia-lens" text at the bottom

## 🚀 Ready to Push

Once you've created the new repository on GitHub, run:

```bash
git init
git add .
git commit -m "Initial commit: Dyslexia Lens - AI-powered reading assistant"
git branch -M main
git remote add origin https://github.com/abhijeet586/NEW_REPO_NAME.git
git push -u origin main
```

**IMPORTANT**: Before running `git add .`, run `git status` to verify no sensitive files are being added!
