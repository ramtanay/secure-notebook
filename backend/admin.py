from flask import Blueprint, request, jsonify, current_app
import jwt
import datetime
import base64
from extensions import db
from flask_cors import CORS

admin_bp = Blueprint('admin', __name__)
CORS(admin_bp)


def verify_admin(req):
    auth = req.headers.get('Authorization')
    if not auth or not auth.startswith("Bearer "):
        return False
    try:
        token = auth.split()[1]
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return decoded.get('admin') is True
    except:
        return False


@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    pwd = data.get('password')
    if pwd == current_app.config['ADMIN_PASSWORD']:
        token = jwt.encode({
            'admin': True,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=3)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify(token=token)
    return jsonify(message='Invalid admin password'), 401


@admin_bp.route('/users', methods=['GET'])
def list_users():
    if not verify_admin(request):
        return jsonify(message='Unauthorized'), 403

    User = current_app.User
    Note = current_app.Note
    users = User.query.all()
    result = []
    for u in users:
        notes_count = Note.query.filter_by(user_id=u.id).count()
        result.append({
            'id': u.id,
            'username': u.username,
            'created_at': u.created_at.isoformat(),
            'notes_count': notes_count,
            'face_image': base64.b64encode(u.face_image).decode('utf-8') if u.face_image else None
        })
    return jsonify(result)


@admin_bp.route('/users/<int:user_id>/notes', methods=['GET'])
def user_notes(user_id):
    if not verify_admin(request):
        return jsonify(message='Unauthorized'), 403

    User = current_app.User
    Note = current_app.Note
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify(message='User not found'), 404

    notes = Note.query.filter_by(user_id=user.id).all()
    return jsonify([{
        'id': n.id,
        'title': n.title,
        'body': n.body,
        'pinned': n.pinned,
        'color': n.color,
        'trashed': n.trashed
    } for n in notes])


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if not verify_admin(request):
        return jsonify(message='Unauthorized'), 403

    User = current_app.User
    Note = current_app.Note

    user = User.query.get(user_id)
    if not user:
        return jsonify(message='User not found'), 404

    Note.query.filter_by(user_id=user.id).delete()
    db.session.delete(user)
    db.session.commit()

    return jsonify(message=f'User {user.username} deleted successfully'), 200
