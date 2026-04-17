# 🚀 Lysto Messenger (AI-Powered Chat)

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**Lysto Messenger** — це повноцінний клієнт-серверний веб-застосунок для обміну повідомленнями у реальному часі. Головною особливістю платформи є глибока інтеграція штучного інтелекту для генерації розумних підказок, а також вбудована аналітика ефективності ШІ за допомогою Metabase.

Проєкт розроблено в рамках дипломної роботи.

---

## ✨ Головний функціонал

* 💬 **Real-Time Спілкування:** Миттєва доставка повідомлень, статусів "онлайн" та сповіщень про прочитання (Read Receipts) завдяки WebSockets (Socket.io).
* 🤖 **AI Асистент:** Генерація швидких відповідей на основі контексту бесіди за допомогою інтеграції з API мовних моделей (Gemini).
* 👥 **Управління групами:** Створення групових чатів, призначення ролей (Адмін/Учасник), кастомізація аватарок та назв груп.
* 📊 **Data Analytics:** Вбудований BI-інструмент (Metabase) для побудови графіків активності чатів та аналізу корисності підказок ШІ.
* ⚡ **Фонова обробка (Background Jobs):** Відправка транзакційних email-листів (верифікація, скидання пароля) винесена в окремі черги через **Redis + BullMQ**, що запобігає блокуванню головного потоку сервера.
* 🔒 **Безпека:** JWT-аутентифікація, безпечне хешування паролів та налаштування приватності профілю.

---

## 🛠 Стек технологій

### Frontend (Client)
* **Core:** React.js, Vite
* **Styling:** SCSS (CSS Modules)
* **State Management:** React Context API
* **Real-time:** Socket.io-client

### Backend (Server)
* **Core:** Node.js, Express, TypeScript
* **Architecture:** Layered Architecture (Repository Pattern)
* **Real-time:** Socket.io (з підготовкою під Redis Pub/Sub Adapter)
* **Queues:** BullMQ (Redis)

### Інфраструктура (Docker Compose)
* **Database:** PostgreSQL 17
* **Cache & Message Broker:** Redis 7
* **Analytics Dashboard:** Metabase

---

## 🚀 Локальний запуск (Getting Started)

### Попередні вимоги
Переконайтеся, що на вашому комп'ютері встановлені:
* [Node.js](https://nodejs.org/) (v18+)
* [Docker](https://www.docker.com/) та Docker Compose
* [Git](https://git-scm.com/)

### 1. Клонування репозиторію
```bash
git clone [https://github.com/maksimboyko05/messengerapp.git](https://github.com/maksimboyko05/messengerapp.git)
cd messengerapp/backend
