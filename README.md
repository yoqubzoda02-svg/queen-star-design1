# Queen Star · Shoe Designer

Инструмент для дизайна и производственных спецификаций обуви.

---

## 🚀 Деплой за 4 шага

---

### Шаг 1 — Firebase (база данных)

1. Перейди на [firebase.google.com](https://firebase.google.com) → **Get started**
2. Создай проект: **Add project** → название `queen-star-designer`
3. В боковом меню: **Build → Firestore Database → Create database**
   - Выбери **Start in test mode** → Next → Enable
4. В боковом меню: **Project Settings** (шестерёнка) → вкладка **General**
5. Листай вниз до **Your apps** → нажми `</>` (Web)
6. Имя приложения: `queen-star-web` → **Register app**
7. Скопируй объект `firebaseConfig` — он нужен на шаге 3

---

### Шаг 2 — GitHub (репозиторий)

1. Перейди на [github.com](https://github.com) → **New repository**
2. Название: `queen-star-designer`
3. **Create repository**
4. Загрузи файлы проекта:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/ВАШ_ЛОГИН/queen-star-designer.git
   git push -u origin main
   ```

---

### Шаг 3 — Vercel (деплой)

1. Перейди на [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. **Add New Project** → выбери репозиторий `queen-star-designer`
3. В разделе **Environment Variables** добавь все переменные из файла `.env.example`,
   вставив значения из Firebase Config (шаг 1):

   | Имя переменной | Значение из Firebase |
   |---|---|
   | `VITE_FIREBASE_API_KEY` | `apiKey` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
   | `VITE_FIREBASE_PROJECT_ID` | `projectId` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
   | `VITE_FIREBASE_APP_ID` | `appId` |

4. **Deploy** — готово! Vercel даст ссылку вида `queen-star-designer.vercel.app`

---

### Шаг 4 — Firestore правила (безопасность)

В Firebase Console → **Firestore → Rules** замени правила на:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /designs/{docId} {
      allow read, write: if true; // Для начала открытый доступ
    }
  }
}
```

> Позже, когда добавишь авторизацию, замени `if true` на `if request.auth != null`

---

## 💻 Локальная разработка

```bash
# Установить зависимости
npm install

# Создать .env из шаблона и вставить свои ключи Firebase
cp .env.example .env

# Запустить локально
npm run dev
```

Приложение откроется на `http://localhost:5173`

---

## 📁 Структура проекта

```
queen-star-designer/
├── src/
│   ├── main.jsx        # Точка входа React
│   ├── App.jsx         # Основной компонент (весь UI)
│   └── firebase.js     # Firebase конфиг + функции Firestore
├── index.html
├── package.json
├── vite.config.js
├── .env.example        # Шаблон переменных окружения
└── .gitignore
```

---

## ✨ Функции

- 🎨 **Дизайн** — 5 типов обуви (Туфли, Балетки, Кроссовки, Босоножки, Сапоги), интерактивная раскраска деталей
- 📋 **Характеристики** — материалы, конструкция, размерный ряд
- 📄 **Спецификация** — готовый лист для фабрики, кнопка печати в PDF
- 💾 **Firebase** — сохранение и загрузка моделей из облака
