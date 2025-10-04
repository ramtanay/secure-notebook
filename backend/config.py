import os

class Config:
    # Database URI (set in .env for production)
    SQLALCHEMY_DATABASE_URI = os.getenv("MYSQL_URI", "sqlite:///notepad.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

    # Temporary upload folder for face recognition
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "user_faces")
