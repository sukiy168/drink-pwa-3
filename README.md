# 🧋 飲料訂購系統 PWA

不需要安裝任何 App！手機開瀏覽器就能用，還可以加入桌面像 App 一樣。

---

## 🚀 部署步驟（一次性，約 15 分鐘）

### 第一步：建立 Firebase 資料庫（免費）

1. 前往 https://console.firebase.google.com/
2. 點「建立專案」→ 輸入專案名稱（例如：drink-order）→ 按下去
3. 左側選單點「建置」→「Realtime Database」
4. 點「建立資料庫」→ 位置選「asia-southeast1（新加坡）」→ 以測試模式啟動
5. 左側選單點「專案設定」（齒輪圖示）→ 往下滑到「你的應用程式」→ 點「</> 網頁」
6. 輸入 App 暱稱（隨便取）→ 「註冊應用程式」
7. 你會看到一段設定碼，**先留著備用**

---

### 第二步：把程式碼放到 GitHub（免費）

1. 前往 https://github.com/ 註冊 / 登入
2. 點右上角「+」→「New repository」→ 輸入名稱（例如：drink-app）→「Create repository」
3. 把這個 `drink-pwa` 資料夾上傳：
   - 點「uploading an existing file」→ 把整個資料夾的檔案拖進去 → Commit

---

### 第三步：部署到 Vercel（免費，全球 CDN）

1. 前往 https://vercel.com/ → 用 GitHub 帳號登入
2. 點「Add New Project」→ 選你剛才的 GitHub repo → 點「Import」
3. **重要**：在「Environment Variables」加入以下設定：
   （把第一步取得的 Firebase 設定填進去）

   | 名稱 | 值 |
   |------|-----|
   | NEXT_PUBLIC_FIREBASE_API_KEY | AIzaSy... |
   | NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | your-project.firebaseapp.com |
   | NEXT_PUBLIC_FIREBASE_DATABASE_URL | https://your-project-rtdb.asia-southeast1.firebasedatabase.app |
   | NEXT_PUBLIC_FIREBASE_PROJECT_ID | your-project |
   | NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET | your-project.appspot.com |
   | NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID | 123456789 |
   | NEXT_PUBLIC_FIREBASE_APP_ID | 1:123456789:web:abc123 |

4. 點「Deploy」→ 等待約 1-2 分鐘
5. 完成後 Vercel 給你一個網址（例如：drink-app.vercel.app）🎉

---

### 第四步：朋友安裝到手機桌面

**Android（Chrome）：**
1. 開啟你的網址
2. 右上角三點選單 → 「新增至主畫面」

**iPhone（Safari）：**
1. 用 Safari 開啟你的網址（必須用 Safari）
2. 下方分享按鈕 → 「加入主畫面」

---

## 📱 使用方式

1. 主揪：輸入暱稱 → 選飲料店 → 「建立揪團」→ 分享房間碼給朋友
2. 朋友：輸入暱稱 + 房間碼 → 「加入點餐」
3. 各自點餐，即時看到大家點了什麼
4. 主揪點「彙整」→ 查看所有訂單 → 複製清單去下單

---

## 🏗️ 本地開發

```bash
npm install
cp .env.local.example .env.local
# 編輯 .env.local 填入 Firebase 設定
npm run dev
# 開啟 http://localhost:3000
```
