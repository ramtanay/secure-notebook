
# 📝 Secure Notebook

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

A **secure notepad application** with **face/password login**, **encrypted notes**, and a **React + Flask** architecture.

---

## 🌟 Features

- 🔒 Secure login with **face recognition** or password  
- 📝 Create, edit, and manage **encrypted notes**  
- 💻 Built with **React frontend** and **Flask backend**  
- ⚡ Lightweight and easy to run locally  

---

## 🖥️ Prerequisites

- **Python 3.8+**  
- **Node.js & npm**  
- **Git**  

---

## 🏗️ Installation & Running

### 1️⃣ Clone the repository
```bash
git clone https://github.com/ramtanay/secure-notebook.git
cd secure-notebook
````

---

### 2️⃣ Setup Backend (Flask)

```bash
cd backend
python -m venv venv          # Create virtual environment
venv\Scripts\activate        # On Windows
# source venv/bin/activate   # On Mac/Linux

pip install -r requirements.txt
python app.py                # Run backend server
```

> Backend runs at `http://127.0.0.1:5000`

---

### 3️⃣ Setup Frontend (React)

Open a **new terminal**:

```bash
cd frontend
npm install                  # Install dependencies
npm start                    # Run React frontend
```

> Frontend runs at `http://localhost:3000` and connects automatically to backend

---

### 4️⃣ Usage

1. Open browser → `http://localhost:3000`
2. Register your account and/or face
3. Create, edit, and secure notes
4. All notes are **encrypted and safe**

---

## 🔧 Tech Stack

| Frontend                       | Backend            | Database |
| ------------------------------ | ------------------ | -------- |
| React, Tailwind, Framer Motion | Flask, JWT, OpenCV | SQLite   |

---

## ⚡ Notes

* Start **backend first** before frontend
* Add `.env` for secret keys if needed
* Stop servers with `Ctrl+C` in terminal

---

> *“Secure your ideas, one note at a time!”* ✨


