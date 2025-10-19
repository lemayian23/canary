print("Testing imports...")

try:
    import psycopg2
    print("✓ psycopg2 imported")
except ImportError as e:
    print(f"✗ psycopg2 import failed: {e}")

try:
    from app.core.database import SessionLocal
    print("✓ Database imports work")
except ImportError as e:
    print(f"✗ Database import failed: {e}")

print("Import test completed")