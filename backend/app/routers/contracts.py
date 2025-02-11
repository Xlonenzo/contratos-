from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.database.models import Contract, Issue, IssueHistory
from backend.utils.auth import get_current_user

router = APIRouter()

@router.post("/contracts/{contract_id}/issues", response_model=IssueResponse)
async def create_contract_issue(
    contract_id: int,
    issue: IssueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verificar se o contrato existe
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Criar a issue
    new_issue = Issue(
        contract_id=contract_id,
        created_by=current_user.id,
        **issue.dict()
    )
    
    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)
    
    # Registrar no histórico
    history_entry = IssueHistory(
        issue_id=new_issue.id,
        changed_fields={
            "action": "create",
            "fields": issue.dict()
        },
        changed_by=current_user.id
    )
    
    db.add(history_entry)
    db.commit()
    
    return new_issue 