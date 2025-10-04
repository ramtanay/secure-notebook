import os
import jwt
import datetime
import hashlib
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from extensions import db
from admin import admin_bp
from recognizer import recognize_user  # optional face recognition
from config import Config
from flask import send_from_directory


def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
    app.config.from_object(Config)

    db.init_app(app)

    # ----------------------- MODELS -----------------------
    class User(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        username = db.Column(db.String(100), unique=True, nullable=False)
        password = db.Column(db.String(255), nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
        face_image = db.Column(db.LargeBinary)  # store face image in DB

    class Note(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        title = db.Column(db.String(200))
        body = db.Column(db.Text)
        pinned = db.Column(db.Boolean, default=False)
        color = db.Column(db.String(50), default='gray700')
        trashed = db.Column(db.Boolean, default=False)
        created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
        updated_at = db.Column(
            db.DateTime,
            default=datetime.datetime.utcnow,
            onupdate=datetime.datetime.utcnow
        )

    app.User = User
    app.Note = Note

    # ----------------------- UTILS -----------------------
    def hash_password(password):
        return hashlib.sha256(password.encode()).hexdigest()

    def generate_token(user=None, admin=False):
        payload = {'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=3)}
        if admin:
            payload['admin'] = True
        else:
            payload['user'] = user
        return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

    def verify_token(req, admin_required=False):
        auth = req.headers.get('Authorization')
        if not auth or not auth.startswith("Bearer "):
            return None
        try:
            token = auth.split()[1]
            decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            if admin_required:
                return decoded.get('admin') is True
            return decoded.get('user')
        except:
            return None

    # ----------------------- USER AUTH -----------------------
    @app.route('/login-password', methods=['POST'])
    def login_password():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify(message='Missing credentials'), 400

        user = User.query.filter_by(username=username, password=hash_password(password)).first()
        if not user:
            return jsonify(message='Invalid credentials'), 401

        token = generate_token(username)
        return jsonify(token=token), 200

    @app.route('/login', methods=['POST'])
    def face_login():
        file = request.files.get('face')
        if not file:
            return jsonify(message='No face data'), 400

        tmp = 'temp_face.jpg'
        file.save(tmp)
        username = recognize_user(tmp)
        os.remove(tmp)
        if not username:
            return jsonify(message='Face not recognized'), 401

        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify(message='User not found'), 404

        token = generate_token(username)
        return jsonify(token=token, user=username), 200

    @app.route('/register', methods=['POST'])
    def register():
        username = request.form.get('username')
        password = request.form.get('password')
        file = request.files.get('face')

        if not username or not password or not file:
            return jsonify(message='All fields required'), 400

        if User.query.filter_by(username=username).first():
            return jsonify(message='User already exists'), 400

        # Save face image into DB
        face_data = file.read()
        user = User(username=username, password=hash_password(password), face_image=face_data)
        db.session.add(user)
        db.session.commit()

        # Save to folder as well for recognizer
        user_folder = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(username))
        os.makedirs(user_folder, exist_ok=True)
        file.stream.seek(0)  # reset pointer
        file.save(os.path.join(user_folder, secure_filename(username) + '.jpg'))

        token = generate_token(username)
        return jsonify(message='Registered successfully', token=token), 201

    @app.route('/set-password', methods=['POST'])
    def set_password():
        username = verify_token(request)
        if not username:
            return jsonify(message='Unauthorized'), 403

        new_password = request.get_json().get('password')
        if not new_password:
            return jsonify(message='Password required'), 400

        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify(message='User not found'), 404

        user.password = hash_password(new_password)
        db.session.commit()
        return jsonify(message='Password updated'), 200

    # ----------------------- NOTES & TRASH -----------------------
    @app.route('/notes', methods=['GET', 'POST'])
    def notes():
        username = verify_token(request)
        if not username:
            return jsonify(message='Unauthorized'), 403
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify(message='User not found'), 404

        if request.method == 'GET':
            notes = Note.query.filter_by(user_id=user.id, trashed=False).all()
            return jsonify([{
                "id": n.id,
                "title": n.title,
                "body": n.body,
                "pinned": n.pinned,
                "color": n.color,
                "trashed": n.trashed,
                "created_at": n.created_at.isoformat(),
                "updated_at": n.updated_at.isoformat()
            } for n in notes]), 200

        data = request.get_json()
        note_data = data.get('note', data)
        note = Note(
            user_id=user.id,
            title=note_data.get('title', ''),
            body=note_data.get('body', ''),
            pinned=note_data.get('pinned', False),
            color=note_data.get('color', 'gray700')
        )
        db.session.add(note)
        db.session.commit()
        return jsonify(message='Note added', note_id=note.id), 201

    @app.route('/notes/<int:note_id>', methods=['GET', 'PUT', 'DELETE'])
    def note_detail(note_id):
        username = verify_token(request)
        if not username:
            return jsonify(message='Unauthorized'), 403
        user = User.query.filter_by(username=username).first()
        note = Note.query.filter_by(id=note_id, user_id=user.id).first()
        if not note:
            return jsonify(message='Not found'), 404

        if request.method == 'GET':
            return jsonify({
                "id": note.id,
                "title": note.title,
                "body": note.body,
                "pinned": note.pinned,
                "color": note.color,
                "trashed": note.trashed
            }), 200
        elif request.method == 'PUT':
            data = request.get_json()
            payload = data.get('note', data)
            note.title = payload.get('title', note.title)
            note.body = payload.get('body', note.body)
            note.pinned = payload.get('pinned', note.pinned)
            note.color = payload.get('color', note.color)
            db.session.commit()
            return jsonify(message='Note updated'), 200
        else:
            db.session.delete(note)
            db.session.commit()
            return jsonify(message='Note deleted'), 200

    @app.route('/trash', methods=['GET'])
    def list_trash():
        username = verify_token(request)
        if not username:
            return jsonify(message='Unauthorized'), 403
        user = User.query.filter_by(username=username).first()
        notes = Note.query.filter_by(user_id=user.id, trashed=True).all()
        return jsonify([{
            "id": n.id,
            "title": n.title,
            "body": n.body,
            "pinned": n.pinned,
            "color": n.color
        } for n in notes]), 200

    @app.route('/trash/<int:note_id>', methods=['PUT', 'DELETE'])
    def trash_action(note_id):
        username = verify_token(request)
        if not username:
            return jsonify(message='Unauthorized'), 403
        user = User.query.filter_by(username=username).first()
        note = Note.query.filter_by(id=note_id, user_id=user.id).first()
        if not note:
            return jsonify(message='Not found'), 404

        if request.method == 'PUT':
            note.trashed = True
            db.session.commit()
            return jsonify(message='Moved to trash'), 200
        else:
            db.session.delete(note)
            db.session.commit()
            return jsonify(message='Permanently deleted'), 200

    @app.route('/restore/<int:note_id>', methods=['PUT'])
    def restore_note(note_id):
        username = verify_token(request)
        if not username:
            return jsonify(message='Unauthorized'), 403
        user = User.query.filter_by(username=username).first()
        note = Note.query.filter_by(id=note_id, user_id=user.id, trashed=True).first()
        if not note:
            return jsonify(message='Not found'), 404
        note.trashed = False
        db.session.commit()
        return jsonify(message='Note restored'), 200
    



# Serve uploaded user images
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


    # ----------------------- ADMIN -----------------------
    app.register_blueprint(admin_bp, url_prefix='/admin')

    return app


if __name__ == "__main__":
    app = create_app()
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    with app.app_context():
        db.create_all()

    debug_mode = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug_mode, use_reloader=False)
