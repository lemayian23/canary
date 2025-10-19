import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        database="canary_db",
        user="canary_user",
        password="canary_password"
    )
    print("✓ Direct PostgreSQL connection successful")

    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM test_cases;")
    count = cursor.fetchone()[0]
    print(f"✓ Found {count} test cases in database")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"✗ Connection failed: {e}")