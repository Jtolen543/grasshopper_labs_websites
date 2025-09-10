from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_health():
    return {"message": "GET method is working"}

@router.post("/")
async def post_health():
    return {"message": "POST method is working"}

@router.put("/")
async def put_health():
    return {"message": "PUT method is working"}

@router.delete("/")
async def delete_health():
    return {"message": "DELETE method is working"}

@router.patch("/")
async def patch_health():
    return {"message": "PATCH method is working"}
