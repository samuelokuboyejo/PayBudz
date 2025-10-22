import pytest
import requests
import time
import uuid


BASE_URL = "https://paybudz-api-staging.kochtech.xyz/"
AUTH_HEADER = {"Authorization": "Bearer test_firebase_token"}

@pytest.fixture(scope="module")
def create_wallet():
    payload = {"currency": "NGN"}
    res = requests.post(f"{BASE_URL}/wallets", json=payload)
    print("DEBUG create_wallet:", res.status_code, res.text)
    assert res.status_code == 201
    return res.json()


def test_wallet_creation(create_wallet):
    assert create_wallet["currency"] == "NGN"
    assert create_wallet["isActive"] is False
    assert "id" in create_wallet


def test_wallet_activation(create_wallet):
    wallet_id = create_wallet["id"]
    res = requests.put(f"{BASE_URL}/wallets/{wallet_id}/activate")
    print("DEBUG activate:", res.status_code, res.text)
    assert res.status_code == 200
    assert res.json()["isActive"] is True


def test_wallet_balance(create_wallet):
    wallet_id = create_wallet["id"]
    res = requests.get(f"{BASE_URL}/wallets/{wallet_id}/balance")
    print("DEBUG balance:", res.status_code, res.text)
    assert res.status_code == 200
    body = res.json()
    assert "availableBalance" in body
    assert body["availableBalance"] == 0


@pytest.fixture(scope="module")
def another_wallet():
    payload = {"currency": "NGN"}
    res = requests.post(f"{BASE_URL}/wallets", json=payload)
    assert res.status_code == 201
    wallet = res.json()
    wallet_id = wallet["id"]
    res = requests.put(f"{BASE_URL}/wallets/{wallet_id}/activate")
    assert res.status_code == 200
    return wallet


def test_wallet_credit_and_balance_update(create_wallet):
    wallet_id = create_wallet["id"]

    topup_payload = {"amount": 1000, "currency": "NGN"}
    res = requests.post(f"{BASE_URL}/wallets/topup", json=topup_payload, headers=AUTH_HEADER)
    print("DEBUG topup:", res.status_code, res.text)
    assert res.status_code in [200, 201]
    body = res.json()
    assert "paymentLink" in body or "amount" in body

    time.sleep(1)
    res_balance = requests.get(f"{BASE_URL}/wallets/{wallet_id}/balance", headers=AUTH_HEADER)
    print("DEBUG balance_after_credit:", res_balance.status_code, res_balance.text)
    assert res_balance.status_code == 200


def test_wallet_cashout_flow(create_wallet):
    wallet_id = create_wallet["id"]
    cashout_payload = {
        "amount": 500,
        "currency": "NGN",
        "bankAccountNumber": "1234567890",
        "bankCode": "044"
    }
    res = requests.post(f"{BASE_URL}/wallets/cashout", json=cashout_payload, headers=AUTH_HEADER)
    print("DEBUG cashout:", res.status_code, res.text)
    assert res.status_code in [200, 201]
    body = res.json()
    assert "status" in body or "id" in body


def test_balance_validation_after_transactions(create_wallet):
    wallet_id = create_wallet["id"]

    res = requests.get(f"{BASE_URL}/wallets/{wallet_id}/balance", headers=AUTH_HEADER)
    assert res.status_code == 200
    initial_balance = res.json()["availableBalance"]

    for _ in range(2):
        requests.post(f"{BASE_URL}/wallets/topup", json={"amount": 1000, "currency": "NGN"}, headers=AUTH_HEADER)
    requests.post(f"{BASE_URL}/wallets/cashout", json={
        "amount": 1000, "currency": "NGN", "bankAccountNumber": "1234567890", "bankCode": "044"
    }, headers=AUTH_HEADER)

    res = requests.get(f"{BASE_URL}/wallets/{wallet_id}/balance", headers=AUTH_HEADER)
    print("DEBUG final_balance:", res.status_code, res.text)
    assert res.status_code == 200
    new_balance = res.json()["availableBalance"]

    assert new_balance != initial_balance


def test_wallet_to_wallet_transfer(create_wallet, another_wallet):
    transfer_payload = {
        "destinationUsername": "destination_user",
        "amount": 200,
        "currency": "NGN",
        "idempotencyKey": str(uuid.uuid4())
    }
    res = requests.post(f"{BASE_URL}/transfers", json=transfer_payload, headers=AUTH_HEADER)
    print("DEBUG transfer:", res.status_code, res.text)
    assert res.status_code in [200, 201]
    body = res.json()
    assert "amount" in body
    assert "fromWalletId" in body
    assert "toWalletId" in body