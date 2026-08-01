from fastapi.testclient import TestClient
import copy
import importlib
import pytest

# Import the app module so tests reference the same global `activities` object
app_module = importlib.import_module("src.app")
app = app_module.app
activities = app_module.activities


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def reset_activities():
    """Restore the in-memory `activities` mapping before each test."""
    backup = copy.deepcopy(activities)
    yield
    activities.clear()
    activities.update(copy.deepcopy(backup))
