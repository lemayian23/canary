"""Initial tables

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create test_cases table
    op.create_table('test_cases',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('input_prompt', sa.Text(), nullable=False),
        sa.Column('expected_behavior', sa.Text(), nullable=False),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_test_cases_id'), 'test_cases', ['id'], unique=False)
    op.create_index(op.f('ix_test_cases_name'), 'test_cases', ['name'], unique=True)

    # Create test_runs table
    op.create_table('test_runs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('trigger_source', sa.String(), nullable=True),
        sa.Column('git_commit', sa.String(), nullable=True),
        sa.Column('git_branch', sa.String(), nullable=True),
        sa.Column('total_cost', sa.Float(), nullable=True),
        sa.Column('judge_model_used', sa.String(), nullable=True),
        sa.Column('total_tests', sa.Integer(), nullable=True),
        sa.Column('passed_tests', sa.Integer(), nullable=True),
        sa.Column('failed_tests', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_test_runs_id'), 'test_runs', ['id'], unique=False)
    op.create_index(op.f('ix_test_runs_name'), 'test_runs', ['name'], unique=False)

    # Create test_results table
    op.create_table('test_results',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('test_run_id', sa.Integer(), nullable=False),
        sa.Column('test_case_id', sa.Integer(), nullable=False),
        sa.Column('input_prompt', sa.Text(), nullable=False),
        sa.Column('actual_output', sa.Text(), nullable=True),
        sa.Column('expected_behavior', sa.Text(), nullable=True),
        sa.Column('severity_score', sa.Float(), nullable=True),
        sa.Column('severity_label', sa.String(), nullable=True),
        sa.Column('change_type', sa.String(), nullable=True),
        sa.Column('reasoning', sa.Text(), nullable=True),
        sa.Column('is_regression', sa.Boolean(), nullable=True),
        sa.Column('judge_cost', sa.Float(), nullable=True),
        sa.Column('processing_time', sa.Float(), nullable=True),
        sa.Column('diff_hash', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['test_case_id'], ['test_cases.id'], ),
        sa.ForeignKeyConstraint(['test_run_id'], ['test_runs.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_test_results_id'), 'test_results', ['id'], unique=False)
    op.create_index(op.f('ix_test_results_diff_hash'), 'test_results', ['diff_hash'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_test_results_diff_hash'), table_name='test_results')
    op.drop_index(op.f('ix_test_results_id'), table_name='test_results')
    op.drop_table('test_results')
    op.drop_index(op.f('ix_test_runs_name'), table_name='test_runs')
    op.drop_index(op.f('ix_test_runs_id'), table_name='test_runs')
    op.drop_table('test_runs')
    op.drop_index(op.f('ix_test_cases_name'), table_name='test_cases')
    op.drop_index(op.f('ix_test_cases_id'), table_name='test_cases')
    op.drop_table('test_cases')