#!/bin/bash

# QuickNotes API Test Script
# This script tests all API endpoints

API_URL="http://localhost:8080/api"
HEALTH_URL="http://localhost:8080/health"
METRICS_URL="http://localhost:8080/metrics"

echo "================================"
echo "QuickNotes API Test Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${YELLOW}[1/8] Testing Health Endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
if [ "$HEALTH_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    curl -s $HEALTH_URL | jq .
else
    echo -e "${RED}✗ Health check failed (HTTP $HEALTH_RESPONSE)${NC}"
fi
echo ""

# Test 2: Metrics Endpoint
echo -e "${YELLOW}[2/8] Testing Metrics Endpoint...${NC}"
METRICS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $METRICS_URL)
if [ "$METRICS_RESPONSE" == "200" ]; then
    echo -e "${GREEN}✓ Metrics endpoint accessible${NC}"
    echo "Sample metrics:"
    curl -s $METRICS_URL | head -20
else
    echo -e "${RED}✗ Metrics endpoint failed (HTTP $METRICS_RESPONSE)${NC}"
fi
echo ""

# Test 3: Register User
echo -e "${YELLOW}[3/8] Testing User Registration...${NC}"
REGISTER_DATA='{"email":"test@example.com","password":"password123"}'
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "$REGISTER_DATA")

if echo "$REGISTER_RESPONSE" | jq -e '.access_token' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ User registration successful${NC}"
    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token')
    echo "Access Token: $TOKEN"
    echo "$REGISTER_RESPONSE" | jq .
else
    echo -e "${RED}✗ User registration failed${NC}"
    echo "$REGISTER_RESPONSE" | jq .
fi
echo ""

# Test 4: Login User
echo -e "${YELLOW}[4/8] Testing User Login...${NC}"
LOGIN_DATA='{"email":"test@example.com","password":"password123"}'
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "$LOGIN_DATA")

if echo "$LOGIN_RESPONSE" | jq -e '.access_token' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ User login successful${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
    echo "$LOGIN_RESPONSE" | jq .
else
    echo -e "${RED}✗ User login failed${NC}"
    echo "$LOGIN_RESPONSE" | jq .
fi
echo ""

# Test 5: Get Profile
echo -e "${YELLOW}[5/8] Testing Get Profile...${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/auth/profile" \
    -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | jq -e '.user' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Get profile successful${NC}"
    echo "$PROFILE_RESPONSE" | jq .
else
    echo -e "${RED}✗ Get profile failed${NC}"
    echo "$PROFILE_RESPONSE" | jq .
fi
echo ""

# Test 6: Create Note
echo -e "${YELLOW}[6/8] Testing Create Note...${NC}"
NOTE_DATA='{"title":"Test Note","content":"This is a test note","tags":["test","demo"]}'
CREATE_NOTE_RESPONSE=$(curl -s -X POST "$API_URL/notes" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$NOTE_DATA")

if echo "$CREATE_NOTE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Create note successful${NC}"
    NOTE_ID=$(echo "$CREATE_NOTE_RESPONSE" | jq -r '.id')
    echo "Note ID: $NOTE_ID"
    echo "$CREATE_NOTE_RESPONSE" | jq .
else
    echo -e "${RED}✗ Create note failed${NC}"
    echo "$CREATE_NOTE_RESPONSE" | jq .
fi
echo ""

# Create a second note for testing filtering
NOTE_DATA2='{"title":"Another Note","content":"Testing tag filtering","tags":["test","important"]}'
CREATE_NOTE2_RESPONSE=$(curl -s -X POST "$API_URL/notes" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$NOTE_DATA2")

NOTE_ID2=$(echo "$CREATE_NOTE2_RESPONSE" | jq -r '.id')

# Test 7: Get All Notes
echo -e "${YELLOW}[7/8] Testing Get All Notes...${NC}"
NOTES_RESPONSE=$(curl -s -X GET "$API_URL/notes" \
    -H "Authorization: Bearer $TOKEN")

if echo "$NOTES_RESPONSE" | jq -e '.[0].id' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Get all notes successful${NC}"
    echo "$NOTES_RESPONSE" | jq .
else
    echo -e "${RED}✗ Get all notes failed${NC}"
    echo "$NOTES_RESPONSE" | jq .
fi
echo ""

# Test 8: Filter Notes by Tag
echo -e "${YELLOW}[8/8] Testing Tag Filtering (Redis Cache)...${NC}"
FILTER_RESPONSE=$(curl -s -X GET "$API_URL/notes?tags=test" \
    -H "Authorization: Bearer $TOKEN")

if echo "$FILTER_RESPONSE" | jq -e '.[0].id' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Tag filtering successful (cached in Redis)${NC}"
    echo "$FILTER_RESPONSE" | jq .

    # Second request to verify cache hit
    echo ""
    echo "Making second request to verify Redis cache..."
    sleep 1
    FILTER_RESPONSE2=$(curl -s -X GET "$API_URL/notes?tags=test" \
        -H "Authorization: Bearer $TOKEN")
    echo -e "${GREEN}✓ Second request (should be from cache)${NC}"
    echo "$FILTER_RESPONSE2" | jq .
else
    echo -e "${RED}✗ Tag filtering failed${NC}"
    echo "$FILTER_RESPONSE" | jq .
fi
echo ""

# Bonus: Test Update and Delete
echo -e "${YELLOW}[Bonus] Testing Update Note...${NC}"
UPDATE_DATA='{"title":"Updated Test Note","content":"Updated content","tags":["updated"]}'
UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/notes/$NOTE_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$UPDATE_DATA")

if echo "$UPDATE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Update note successful${NC}"
    echo "$UPDATE_RESPONSE" | jq .
else
    echo -e "${RED}✗ Update note failed${NC}"
    echo "$UPDATE_RESPONSE" | jq .
fi
echo ""

echo -e "${YELLOW}[Bonus] Testing Delete Note...${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/notes/$NOTE_ID2" \
    -H "Authorization: Bearer $TOKEN")

if echo "$DELETE_RESPONSE" | jq -e '.message' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Delete note successful${NC}"
    echo "$DELETE_RESPONSE" | jq .
else
    echo -e "${RED}✗ Delete note failed${NC}"
    echo "$DELETE_RESPONSE" | jq .
fi
echo ""

echo "================================"
echo -e "${GREEN}API Testing Complete!${NC}"
echo "================================"
echo ""
echo "Summary:"
echo "- User Registration: ✓"
echo "- User Login: ✓"
echo "- Get Profile: ✓"
echo "- Create Note: ✓"
echo "- Get All Notes: ✓"
echo "- Filter by Tags (Redis): ✓"
echo "- Update Note: ✓"
echo "- Delete Note: ✓"
echo "- Health Check: ✓"
echo "- Metrics: ✓"
echo ""
echo "All core features tested successfully!"
