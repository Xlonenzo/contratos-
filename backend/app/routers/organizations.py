from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Organization
from ..schemas import OrganizationCreate, OrganizationUpdate, OrganizationResponse
from ..auth import get_current_user

router = APIRouter()

@router.post("/organizations", response_model=OrganizationResponse)
def create_organization(
    org: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    new_org = Organization(
        **org.dict(),
        created_by=current_user.id,
        last_modified_by=current_user.id
    )
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    return new_org

@router.get("/organizations", response_model=List[OrganizationResponse])
def list_organizations(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(Organization).all()

@router.get("/organizations/{org_id}", response_model=OrganizationResponse)
def get_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    org = db.query(Organization).filter(Organization.org_id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

@router.put("/organizations/{org_id}", response_model=OrganizationResponse)
def update_organization(
    org_id: int,
    org_update: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    org = db.query(Organization).filter(Organization.org_id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    for key, value in org_update.dict(exclude_unset=True).items():
        setattr(org, key, value)
    
    org.last_modified_by = current_user.id
    db.commit()
    db.refresh(org)
    return org

@router.delete("/organizations/{org_id}")
def delete_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    org = db.query(Organization).filter(Organization.org_id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    db.delete(org)
    db.commit()
    return {"message": "Organization deleted"} 