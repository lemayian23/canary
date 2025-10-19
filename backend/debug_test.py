print("=== STARTING DEBUG TEST ===")

# Test basic Python
print("1. Basic Python works")

# Test imports
try:
    import psycopg2

    print("2. psycopg2 import: SUCCESS")
except Exception as e:
    print(f"2. psycopg2 import: FAILED - {e}")

# Test database connection
try:
    conn = psycopg2.connect(
        host="localhost",
        database="canary_db",
        user="canary_user",
        password="canary_password",
        port=5432
    )
    print("3. Database connection: SUCCESS")

    cursor = conn.cursor()
    cursor.execute("SELECT 1")
    result = cursor.fetchone()
    print(f"4. Database query: SUCCESS - got {result}")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"3. Database connection: FAILED - {e}")

print("=== DEBUG TEST COMPLETE ===")