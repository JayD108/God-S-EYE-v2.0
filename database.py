from neo4j import GraphDatabase
from .config import NEO4J_URI, NEO4J_AUTH

driver = None


def init_driver():
    global driver
    try:
        driver = GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH)
        driver.verify_connectivity()
        print(f"✅ Connected to Neo4j at {NEO4J_URI}")
    except Exception as e:
        print(f"❌ Neo4j Connection Failed: {e}")


def get_driver():
    return driver


def run_query(query, params={}):
    with driver.session() as session:
        return [dict(record) for record in session.run(query, params)]