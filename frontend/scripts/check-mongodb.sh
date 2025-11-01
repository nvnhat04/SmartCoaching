#!/bin/bash

# MongoDB Troubleshooting Script
# Diagnoses common MongoDB issues

echo "🔍 MongoDB Troubleshooting Tool"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check 1: Is MongoDB installed?
echo -e "${BLUE}1. Checking if MongoDB is installed...${NC}"
if command -v mongod &> /dev/null; then
    VERSION=$(mongod --version | head -n 1)
    echo -e "${GREEN}✓${NC} MongoDB is installed: $VERSION"
else
    echo -e "${RED}✗${NC} MongoDB is NOT installed"
    echo "  → Run: bash scripts/install-mongodb.sh"
    exit 1
fi
echo ""

# Check 2: Is MongoDB service running?
echo -e "${BLUE}2. Checking if MongoDB service is running...${NC}"
if systemctl is-active --quiet mongod 2>/dev/null; then
    echo -e "${GREEN}✓${NC} MongoDB service is running"
    systemctl status mongod --no-pager -l | head -n 3
elif systemctl is-active --quiet mongodb 2>/dev/null; then
    echo -e "${GREEN}✓${NC} MongoDB service is running (mongodb)"
    systemctl status mongodb --no-pager -l | head -n 3
else
    echo -e "${RED}✗${NC} MongoDB service is NOT running"
    echo "  → Start it: sudo systemctl start mongod"
    echo "  → Enable on boot: sudo systemctl enable mongod"
fi
echo ""

# Check 3: Is MongoDB listening on port 27017?
echo -e "${BLUE}3. Checking if MongoDB is listening on port 27017...${NC}"
if ss -tuln | grep -q ":27017"; then
    echo -e "${GREEN}✓${NC} MongoDB is listening on port 27017"
    ss -tuln | grep ":27017"
else
    echo -e "${RED}✗${NC} MongoDB is NOT listening on port 27017"
    echo "  → Check config: /etc/mongod.conf"
    echo "  → Check logs: sudo tail -f /var/log/mongodb/mongod.log"
fi
echo ""

# Check 4: Can we connect to MongoDB?
echo -e "${BLUE}4. Testing MongoDB connection...${NC}"
if command -v mongosh &> /dev/null; then
    if timeout 5 mongosh --eval "db.version()" --quiet 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Can connect to MongoDB"
        DB_VERSION=$(mongosh --eval "db.version()" --quiet 2>/dev/null)
        echo "  Database version: $DB_VERSION"
    else
        echo -e "${RED}✗${NC} Cannot connect to MongoDB"
        echo "  → Check if service is running: sudo systemctl status mongod"
        echo "  → Check logs: sudo tail -f /var/log/mongodb/mongod.log"
    fi
elif command -v mongo &> /dev/null; then
    if timeout 5 mongo --eval "db.version()" --quiet 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Can connect to MongoDB"
        DB_VERSION=$(mongo --eval "db.version()" --quiet 2>/dev/null)
        echo "  Database version: $DB_VERSION"
    else
        echo -e "${RED}✗${NC} Cannot connect to MongoDB"
    fi
else
    echo -e "${YELLOW}⚠${NC}  MongoDB shell not found"
fi
echo ""

# Check 5: Disk space
echo -e "${BLUE}5. Checking disk space...${NC}"
DATA_DIR="/var/lib/mongodb"
if [ -d "$DATA_DIR" ]; then
    DISK_USAGE=$(df -h "$DATA_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    AVAILABLE=$(df -h "$DATA_DIR" | awk 'NR==2 {print $4}')
    if [ "$DISK_USAGE" -lt 80 ]; then
        echo -e "${GREEN}✓${NC} Disk space OK (${DISK_USAGE}% used, ${AVAILABLE} available)"
    elif [ "$DISK_USAGE" -lt 90 ]; then
        echo -e "${YELLOW}⚠${NC}  Disk space warning (${DISK_USAGE}% used, ${AVAILABLE} available)"
    else
        echo -e "${RED}✗${NC} Low disk space (${DISK_USAGE}% used, ${AVAILABLE} available)"
        echo "  → Clean up space or move data directory"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Data directory not found: $DATA_DIR"
fi
echo ""

# Check 6: Permissions
echo -e "${BLUE}6. Checking file permissions...${NC}"
if [ -d "/var/lib/mongodb" ]; then
    OWNER=$(stat -c '%U:%G' /var/lib/mongodb)
    if [ "$OWNER" = "mongodb:mongodb" ]; then
        echo -e "${GREEN}✓${NC} Data directory permissions OK ($OWNER)"
    else
        echo -e "${RED}✗${NC} Incorrect permissions: $OWNER"
        echo "  → Fix: sudo chown -R mongodb:mongodb /var/lib/mongodb"
    fi
else
    echo -e "${RED}✗${NC} Data directory not found: /var/lib/mongodb"
fi

if [ -d "/var/log/mongodb" ]; then
    LOG_OWNER=$(stat -c '%U:%G' /var/log/mongodb)
    if [ "$LOG_OWNER" = "mongodb:mongodb" ]; then
        echo -e "${GREEN}✓${NC} Log directory permissions OK ($LOG_OWNER)"
    else
        echo -e "${RED}✗${NC} Incorrect log permissions: $LOG_OWNER"
        echo "  → Fix: sudo chown -R mongodb:mongodb /var/log/mongodb"
    fi
fi
echo ""

# Check 7: Configuration file
echo -e "${BLUE}7. Checking configuration file...${NC}"
CONFIG_FILE="/etc/mongod.conf"
if [ -f "$CONFIG_FILE" ]; then
    echo -e "${GREEN}✓${NC} Config file exists: $CONFIG_FILE"
    
    # Check bind IP
    BIND_IP=$(grep -A 1 "net:" "$CONFIG_FILE" | grep "bindIp:" | sed 's/.*bindIp: //' | tr -d ' ')
    if [ -n "$BIND_IP" ]; then
        echo "  Bind IP: $BIND_IP"
    fi
    
    # Check port
    PORT=$(grep -A 2 "net:" "$CONFIG_FILE" | grep "port:" | sed 's/.*port: //' | tr -d ' ')
    if [ -n "$PORT" ]; then
        echo "  Port: $PORT"
    fi
    
    # Check if auth is enabled
    if grep -q "authorization: enabled" "$CONFIG_FILE"; then
        echo -e "  Authentication: ${YELLOW}Enabled${NC}"
    else
        echo -e "  Authentication: ${GREEN}Disabled${NC}"
    fi
else
    echo -e "${RED}✗${NC} Config file not found: $CONFIG_FILE"
fi
echo ""

# Check 8: Recent log errors
echo -e "${BLUE}8. Checking recent log errors...${NC}"
LOG_FILE="/var/log/mongodb/mongod.log"
if [ -f "$LOG_FILE" ]; then
    ERROR_COUNT=$(sudo grep -i "error\|exception\|fatal" "$LOG_FILE" 2>/dev/null | tail -n 50 | wc -l)
    if [ "$ERROR_COUNT" -eq 0 ]; then
        echo -e "${GREEN}✓${NC} No recent errors in logs"
    elif [ "$ERROR_COUNT" -lt 10 ]; then
        echo -e "${YELLOW}⚠${NC}  Found $ERROR_COUNT recent error(s)"
        echo "  → View: sudo tail -n 50 $LOG_FILE | grep -i error"
    else
        echo -e "${RED}✗${NC} Found $ERROR_COUNT recent error(s)"
        echo "  → View: sudo tail -n 50 $LOG_FILE | grep -i error"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Log file not found: $LOG_FILE"
fi
echo ""

# Check 9: Application connection string
echo -e "${BLUE}9. Checking application configuration...${NC}"
ENV_FILE="/home/tuanjhg/Project/SmartCoaching/.env.local"
if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}✓${NC} .env.local file exists"
    
    if grep -q "MONGODB_URI" "$ENV_FILE"; then
        MONGO_URI=$(grep "MONGODB_URI" "$ENV_FILE" | cut -d '=' -f 2)
        # Hide password in display
        SAFE_URI=$(echo "$MONGO_URI" | sed 's/:\/\/.*:.*@/:\/\/***:***@/')
        echo "  Connection string: $SAFE_URI"
    else
        echo -e "${RED}✗${NC} MONGODB_URI not found in .env.local"
        echo "  → Add: MONGODB_URI=mongodb://localhost:27017/smart-coaching"
    fi
else
    echo -e "${RED}✗${NC} .env.local file not found"
    echo "  → Create from template: cp .env.example .env.local"
fi
echo ""

# Summary
echo "════════════════════════════════"
echo "📊 Summary"
echo "════════════════════════════════"
echo ""

# Test application connection
echo -e "${BLUE}Testing application connection...${NC}"
cd /home/tuanjhg/Project/SmartCoaching
if npm run seed:admin 2>&1 | grep -q "Connected to MongoDB"; then
    echo -e "${GREEN}✓${NC} Application can connect to MongoDB"
    echo ""
    echo -e "${GREEN}✅ Everything looks good!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm run dev"
    echo "  2. Visit: http://localhost:3000"
else
    echo -e "${RED}✗${NC} Application cannot connect to MongoDB"
    echo ""
    echo -e "${RED}⚠️  Issues detected. Please review the checks above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  • Start MongoDB: sudo systemctl start mongod"
    echo "  • Fix permissions: sudo chown -R mongodb:mongodb /var/lib/mongodb"
    echo "  • View logs: sudo tail -f /var/log/mongodb/mongod.log"
    echo "  • Check config: cat /etc/mongod.conf"
fi
echo ""

echo "📖 Full documentation: docs/MONGODB_SETUP_LINUX.md"
echo ""
