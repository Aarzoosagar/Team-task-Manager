def serialize(doc):
    return {
        **{k: v for k, v in doc.items() if k != "_id" and k != "password"},
        "id": str(doc["_id"])
    }