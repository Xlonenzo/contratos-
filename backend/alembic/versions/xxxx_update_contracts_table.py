"""update contracts table

Revision ID: xxxx
Revises: previous_revision
Create Date: 2024-02-17 14:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'xxxx'
down_revision = 'previous_revision'
branch_labels = None
depends_on = None

def upgrade():
    # Adicionar novas colunas
    op.add_column('contracts', sa.Column('party_a_individual_id', sa.Integer(), nullable=True), schema='xlon')
    op.add_column('contracts', sa.Column('party_b_individual_id', sa.Integer(), nullable=True), schema='xlon')
    op.add_column('contracts', sa.Column('document_content', sa.Text(), nullable=True), schema='xlon')
    
    # Remover restrição NOT NULL das colunas existentes
    op.alter_column('contracts', 'party_a_id',
                    existing_type=sa.Integer(),
                    nullable=True,
                    schema='xlon')
    op.alter_column('contracts', 'party_b_id',
                    existing_type=sa.Integer(),
                    nullable=True,
                    schema='xlon')
    
    # Remover colunas não utilizadas
    op.drop_column('contracts', 'approval_status', schema='xlon')
    op.drop_column('contracts', 'approved_by', schema='xlon')
    op.drop_column('contracts', 'document_url', schema='xlon')
    
    # Adicionar chaves estrangeiras
    op.create_foreign_key(
        'fk_contracts_party_a_individual',
        'contracts',
        'individuals',
        ['party_a_individual_id'],
        ['id'],
        source_schema='xlon',
        referent_schema='xlon',
        ondelete='CASCADE'
    )
    op.create_foreign_key(
        'fk_contracts_party_b_individual',
        'contracts',
        'individuals',
        ['party_b_individual_id'],
        ['id'],
        source_schema='xlon',
        referent_schema='xlon',
        ondelete='CASCADE'
    )

def downgrade():
    # Remover chaves estrangeiras
    op.drop_constraint('fk_contracts_party_a_individual', 'contracts', schema='xlon')
    op.drop_constraint('fk_contracts_party_b_individual', 'contracts', schema='xlon')
    
    # Remover novas colunas
    op.drop_column('contracts', 'party_a_individual_id', schema='xlon')
    op.drop_column('contracts', 'party_b_individual_id', schema='xlon')
    op.drop_column('contracts', 'document_content', schema='xlon')
    
    # Restaurar restrição NOT NULL
    op.alter_column('contracts', 'party_a_id',
                    existing_type=sa.Integer(),
                    nullable=False,
                    schema='xlon')
    op.alter_column('contracts', 'party_b_id',
                    existing_type=sa.Integer(),
                    nullable=False,
                    schema='xlon')
    
    # Restaurar colunas removidas
    op.add_column('contracts', sa.Column('approval_status', sa.String(50), nullable=True), schema='xlon')
    op.add_column('contracts', sa.Column('approved_by', sa.Integer(), nullable=True), schema='xlon')
    op.add_column('contracts', sa.Column('document_url', sa.String(500), nullable=True), schema='xlon') 