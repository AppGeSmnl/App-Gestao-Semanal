from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Union, Optional
from datetime import datetime
from zoneinfo import ZoneInfo
import os
import uuid
import logging

# ================= LOG =================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("API")

# ================= APP =================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://app-gestao-semanal-virid.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= DATABASE =================

mongo_url = os.environ.get("GESTSMNL_DB")
db_name = "gestsmnl"

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# ================= TIMEZONE =================

BRAZIL_TZ = ZoneInfo("America/Sao_Paulo")

def brazil_now():
    return datetime.now(BRAZIL_TZ).isoformat()

# ================= MODELS =================

class DemandCreate(BaseModel):
    description: str
    priority: str
    responsible: Union[List[str], str]
    subgroup: Union[List[str], str]
    category: str = "this_week"
    observation: Optional[str] = ""
    deliveryDate: Optional[str] = ""

class DemandUpdate(BaseModel):
    description: Optional[str] = None
    priority: Optional[str] = None
    responsible: Optional[Union[List[str], str]] = None
    subgroup: Optional[Union[List[str], str]] = None
    category: Optional[str] = None
    observation: Optional[str] = None
    deliveryDate: Optional[str] = None

class Demand(BaseModel):
    id: str
    description: str
    priority: str
    responsible: Union[List[str], str]
    subgroup: Union[List[str], str]
    category: str
    observation: Optional[str]
    deliveryDate: Optional[str]
    created_at: str
    updated_at: str

class BulkDeleteRequest(BaseModel):
    ids: List[str]

class GeneralNoticeCreate(BaseModel):
    text: str

class GeneralNotice(BaseModel):
    id: str
    text: str
    created_at: str

# ================= COMPLETED DEMANDS =================

class CompletedDemand(BaseModel):
    id: str
    description: str
    priority: str
    responsible: Union[List[str], str]
    subgroup: Union[List[str], str]
    category: str
    observation: Optional[str]
    deliveryDate: Optional[str]
    created_at: str
    updated_at: str
    completed_at: str


class CompleteDemandsRequest(BaseModel):
    ids: List[str]


# ================= TEAM MEMBERS =================

class TeamMemberCreate(BaseModel):
    name: str


class TeamMember(BaseModel):
    id: str
    name: str
    active: bool
    created_at: str


# ================= SUBGROUPS =================

class SubgroupCreate(BaseModel):
    name: str


class Subgroup(BaseModel):
    id: str
    name: str
    active: bool
    created_at: str

# ================= ROUTER =================

api = APIRouter(prefix="/api")

# ================= HEALTH =================

@app.api_route("/", methods=["GET", "HEAD"])
async def health():
    return {"status": "ok"}

@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    return {"status": "healthy"}

# ================= DEMANDS =================

@api.get("/demands", response_model=List[Demand])
async def get_demands():
    return await db.demands.find({}, {"_id": 0}).to_list(1000)

@api.post("/demands", status_code=201)
async def create_demand(demand: DemandCreate):
    now = brazil_now()

    data = demand.model_dump()

    if isinstance(data["responsible"], list):
        data["responsible"] = ", ".join(data["responsible"])
    if isinstance(data["subgroup"], list):
        data["subgroup"] = ", ".join(data["subgroup"])

    demand_id = f"DMD-{uuid.uuid4().hex[:8].upper()}"

    data.update({
        "id": demand_id,
        "created_at": now,
        "updated_at": now
    })

    await db.demands.insert_one(data)

    return {
        "success": True,
        "id": demand_id
    }

@api.put("/demands/{demand_id}")
async def update_demand(demand_id: str, update: DemandUpdate):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}

    if "responsible" in update_data and isinstance(update_data["responsible"], list):
        update_data["responsible"] = ", ".join(update_data["responsible"])
    if "subgroup" in update_data and isinstance(update_data["subgroup"], list):
        update_data["subgroup"] = ", ".join(update_data["subgroup"])

    update_data["updated_at"] = brazil_now()

    result = await db.demands.update_one({"id": demand_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(404, "Demanda não encontrada")

    return {"success": True}

@api.post("/demands/bulk-delete")
async def bulk_delete_demands(req: BulkDeleteRequest):
    result = await db.demands.delete_many({"id": {"$in": req.ids}})
    return {"deleted": result.deleted_count}

# ================= COMPLETED DEMANDS =================

@api.get("/completed-demands")
async def get_completed_demands():
    return await db.completed_demands.find({}, {"_id": 0}).to_list(5000)


@api.post("/demands/complete")
async def complete_demands(req: CompleteDemandsRequest):
    now = brazil_now()

    demands = await db.demands.find(
        {"id": {"$in": req.ids}},
        {"_id": 0}
    ).to_list(5000)

    if not demands:
        raise HTTPException(404, "Nenhuma demanda encontrada")

    completed = []

    for demand in demands:
        demand["completed_at"] = now
        completed.append(demand)

    await db.completed_demands.insert_many(completed)

    await db.demands.delete_many({
        "id": {"$in": req.ids}
    })

    return {
        "success": True,
        "completed": len(completed)
    }


@api.post("/completed-demands/bulk-delete")
async def delete_completed_demands(req: BulkDeleteRequest):
    result = await db.completed_demands.delete_many({
        "id": {"$in": req.ids}
    })

    return {
        "deleted": result.deleted_count
    }

# ================= GENERAL NOTICES =================

@api.get("/general-notices", response_model=List[GeneralNotice])
async def get_general_notices():
    return await db.general_notices.find({}, {"_id": 0}).to_list(1000)

@api.post("/general-notices", status_code=201)
async def create_general_notice(data: GeneralNoticeCreate):
    now = brazil_now()
    notice_id = f"NOTICE-{uuid.uuid4().hex[:8].upper()}"

    notice = {
        "id": notice_id,
        "text": data.text,
        "created_at": now
    }

    await db.general_notices.insert_one(notice)

    return {
        "success": True,
        "id": notice_id
    }

@api.post("/general-notices/bulk-delete")
async def delete_general_notices(req: BulkDeleteRequest):
    result = await db.general_notices.delete_many({"id": {"$in": req.ids}})
    return {"deleted": result.deleted_count}

# ================= TEAM MEMBERS =================

@api.get("/team-members")
async def get_team_members():
    return await db.team_members.find(
        {"active": True},
        {"_id": 0}
    ).to_list(1000)


@api.post("/team-members")
async def create_team_member(data: TeamMemberCreate):
    member = {
        "id": f"USR-{uuid.uuid4().hex[:8].upper()}",
        "name": data.name,
        "active": True,
        "created_at": brazil_now()
    }

    await db.team_members.insert_one(member)

    return {
        "success": True,
        "id": member["id"]
    }


@api.delete("/team-members/{member_id}")
async def delete_team_member(member_id: str):
    result = await db.team_members.update_one(
        {"id": member_id},
        {"$set": {"active": False}}
    )

    if result.matched_count == 0:
        raise HTTPException(404, "Responsável não encontrado")

    return {"success": True}


# ================= SUBGROUPS =================

@api.get("/subgroups")
async def get_subgroups():
    return await db.subgroups.find(
        {"active": True},
        {"_id": 0}
    ).to_list(1000)


@api.post("/subgroups")
async def create_subgroup(data: SubgroupCreate):
    subgroup = {
        "id": f"SGP-{uuid.uuid4().hex[:8].upper()}",
        "name": data.name,
        "active": True,
        "created_at": brazil_now()
    }

    await db.subgroups.insert_one(subgroup)

    return {
        "success": True,
        "id": subgroup["id"]
    }


@api.delete("/subgroups/{subgroup_id}")
async def delete_subgroup(subgroup_id: str):
    result = await db.subgroups.update_one(
        {"id": subgroup_id},
        {"$set": {"active": False}}
    )

    if result.matched_count == 0:
        raise HTTPException(404, "Subgrupo não encontrado")

    return {"success": True}

# ================= REGISTER ROUTER =================

app.include_router(api)
