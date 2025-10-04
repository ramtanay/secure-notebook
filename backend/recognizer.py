# backend/recognizer.py
import os
from deepface import DeepFace

def recognize_user(path):
    try:
        result = DeepFace.find(
            img_path=path,
            db_path="user_faces",
            model_name="ArcFace",
            enforce_detection=False
        )
        if result and not result[0].empty:
            df = result[0].sort_values(by="distance", ascending=True)
            best = df.iloc[0]
            print(f"[Recognizer] 🔍 Best match: {best['identity']} with distance {best['distance']:.4f}")

            identity_path = best['identity']
            username = os.path.basename(os.path.dirname(identity_path))

            # ✅ Return username regardless of distance
            if best['distance'] < 0.75:
                print(f"[Recognizer] ✅ Accepted match for {username}")
            else:
                print(f"[Recognizer] ⚠️ Match for {username} is weak (distance {best['distance']:.4f})")
            
            return username  # always return username for login or registration checks
        else:
            print("[Recognizer] ❌ No matches found in database.")
    except Exception as e:
        print("DeepFace error:", e)
    return None
