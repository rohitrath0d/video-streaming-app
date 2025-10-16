from flask import Blueprint, request, jsonify
from db.mongoConnect import overlays_collection
from bson.objectid import ObjectId

overlays_bp = Blueprint('overlays', __name__)


@overlays_bp.route('/', methods=['POST'])
def create_overlay():
  try:
    # data = request.get_json()
    data = request.json
    overlay = {
        "content": data.get("content"),
        "position": data.get("position", {"x": 0, "y": 0}),
        "size": data.get("size", {"width": 100, "height": 50}),
    }

    result = overlays_collection.insert_one(overlay)
    overlay['_id'] = str(result.inserted_id)
    return jsonify({
        "success": True,
        "message": "Overlay created",
        "overlay": overlay
    }), 201

  except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@overlays_bp.route('/', methods=['GET'])
def get_overlays():
    try:
        overlays = []
        for o in overlays_collection.find():
            o["_id"] = str(o["_id"])    # convert ObjectId to string for JSON
            overlays.append(o)
        return jsonify({
            "success": True,
            "overlays": overlays
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })


@overlays_bp.route('/<overlay_id>', methods=['PUT'])
def update_overlay(overlay_id):
  try:
    data = request.json
    update_data = {
        "content": data.get("content"),
        "position": data.get("position"),
        "size": data.get("size"),
    }
    
    # Remove keys with None
    update_data = {k: v for k, v in update_data.items() if v is not None}
    
    result = overlays_collection.update_one(
        {"_id": ObjectId(overlay_id)},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        return jsonify({
            "success": False,
            "message": "Overlay not found"
        }), 404
    
    return jsonify({
            "success": True,
            "message": "Overlay updated"
        }), 200

  except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@overlays_bp.route("/<overlay_id>", methods=["DELETE"])
def delete_overlay(overlay_id):
    try:
        result = overlays_collection.delete_one({"_id": ObjectId(overlay_id)})
        if result.deleted_count > 0:
            return jsonify({
                "success": True,
                "message": "Overlay deleted"
            }), 200
        return jsonify({"success": False, "message": "Overlay not found"}), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })
