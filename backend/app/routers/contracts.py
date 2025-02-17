from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.database.models import Contract, Issue, IssueHistory, Empresa
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

@router.post("/contracts", response_model=Contract)
async def create_contract(
    contract: ContractCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Verificar se o número do contrato já existe
        existing_contract = db.query(Contract).filter(
            Contract.contract_number == contract.contract_number
        ).first()
        if existing_contract:
            raise HTTPException(status_code=400, detail="Número de contrato já existe")

        # Verificar empresas
        if contract.party_a_id:
            empresa_a = db.query(Empresa).filter(
                Empresa.id == contract.party_a_id
            ).first()
            if not empresa_a:
                raise HTTPException(status_code=400, detail="Empresa A não encontrada")

        if contract.party_b_id:
            empresa_b = db.query(Empresa).filter(
                Empresa.id == contract.party_b_id
            ).first()
            if not empresa_b:
                raise HTTPException(status_code=400, detail="Empresa B não encontrada")

        # Criar novo contrato
        contract_data = contract.dict()
        db_contract = Contract(**contract_data)
        db.add(db_contract)
        db.commit()
        db.refresh(db_contract)
        return db_contract
    except Exception as e:
        db.rollback()
        print("Erro ao criar contrato:", str(e))
        raise HTTPException(status_code=400, detail=str(e)) 