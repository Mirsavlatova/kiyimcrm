from sqlalchemy.orm import Session
from app.models.all_models import AuditLog
from typing import Optional


def log_action(
    db: Session,
    user_id: Optional[int],
    action: str,
    table_name: Optional[str] = None,
    record_id: Optional[int] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None
):
    log = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        details=details,
        ip_address=ip_address
    )
    db.add(log)
    # Don't commit here — let the caller commit
