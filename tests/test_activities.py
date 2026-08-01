def test_get_activities(client):
    # Arrange
    # Act
    resp = client.get("/activities")
    # Assert
    assert resp.status_code == 200
    data = resp.json()
    assert "Chess Club" in data


def test_signup_success(client):
    # Arrange
    activity = "Chess Club"
    email = "newstudent@example.com"

    # Act
    resp = client.post(f"/activities/{activity}/signup", params={"email": email})

    # Assert
    assert resp.status_code == 200
    assert "signed up" in resp.json().get("message", "").lower()

    # Verify added
    resp2 = client.get("/activities")
    participants = resp2.json()[activity]["participants"]
    assert email.lower() in [p.lower() for p in participants]


def test_duplicate_signup_returns_400(client):
    # Arrange
    activity = "Chess Club"
    existing = "michael@mergington.edu"

    # Act
    resp = client.post(f"/activities/{activity}/signup", params={"email": existing})

    # Assert
    assert resp.status_code == 400


def test_remove_participant_success(client):
    # Arrange
    activity = "Chess Club"
    existing = "michael@mergington.edu"

    # Act
    resp = client.delete(f"/activities/{activity}/participants", params={"email": existing})

    # Assert
    assert resp.status_code == 200
    # Verify removed
    resp2 = client.get("/activities")
    participants = resp2.json()[activity]["participants"]
    assert existing.lower() not in [p.lower() for p in participants]


def test_delete_nonexistent_participant_returns_404(client):
    # Arrange
    activity = "Chess Club"
    email = "notfound@example.com"

    # Act
    resp = client.delete(f"/activities/{activity}/participants", params={"email": email})

    # Assert
    assert resp.status_code == 404
