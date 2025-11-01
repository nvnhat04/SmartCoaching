#!/bin/bash

# MongoDB Installation Script for Ubuntu/Debian
# Smart Coaching Application

set -e

echo "🚀 MongoDB Installation Script for Smart Coaching"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}❌ Please do not run this script as root${NC}"
    echo "Run: bash scripts/install-mongodb.sh"
    exit 1
fi

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
else
    echo -e "${RED}❌ Cannot detect OS. Please install MongoDB manually.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Detected OS: $OS $VERSION"
echo ""

# Check if MongoDB is already installed
if command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is already installed${NC}"
    mongod --version
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# Install for Ubuntu/Debian
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    echo "📦 Installing MongoDB for Ubuntu/Debian..."
    echo ""
    
    # Step 1: Import GPG key
    echo "1️⃣  Importing MongoDB GPG key..."
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    echo -e "${GREEN}✓${NC} GPG key imported"
    echo ""
    
    # Step 2: Add MongoDB repository
    echo "2️⃣  Adding MongoDB repository..."
    if [ "$VERSION_ID" = "22.04" ]; then
        echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
            sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    elif [ "$VERSION_ID" = "20.04" ]; then
        echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | \
            sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    else
        echo -e "${YELLOW}⚠️  Ubuntu version $VERSION_ID may not be officially supported${NC}"
        echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
            sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    fi
    echo -e "${GREEN}✓${NC} Repository added"
    echo ""
    
    # Step 3: Update package database
    echo "3️⃣  Updating package database..."
    sudo apt-get update
    echo -e "${GREEN}✓${NC} Package database updated"
    echo ""
    
    # Step 4: Install MongoDB
    echo "4️⃣  Installing MongoDB (this may take a few minutes)..."
    sudo apt-get install -y mongodb-org
    echo -e "${GREEN}✓${NC} MongoDB installed"
    echo ""
    
    # Step 5: Start MongoDB
    echo "5️⃣  Starting MongoDB service..."
    sudo systemctl start mongod
    sudo systemctl enable mongod
    echo -e "${GREEN}✓${NC} MongoDB service started"
    echo ""
    
    # Step 6: Check status
    echo "6️⃣  Checking MongoDB status..."
    sleep 2
    if sudo systemctl is-active --quiet mongod; then
        echo -e "${GREEN}✓${NC} MongoDB is running"
    else
        echo -e "${RED}❌ MongoDB failed to start${NC}"
        echo "Check logs: sudo tail -f /var/log/mongodb/mongod.log"
        exit 1
    fi
    echo ""

elif [ "$OS" = "fedora" ] || [ "$OS" = "rhel" ] || [ "$OS" = "centos" ]; then
    echo "📦 Installing MongoDB for Fedora/RHEL/CentOS..."
    echo ""
    
    # Create repo file
    echo "1️⃣  Creating MongoDB repository..."
    sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo > /dev/null <<EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/8/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF
    echo -e "${GREEN}✓${NC} Repository created"
    echo ""
    
    # Install MongoDB
    echo "2️⃣  Installing MongoDB..."
    sudo yum install -y mongodb-org
    echo -e "${GREEN}✓${NC} MongoDB installed"
    echo ""
    
    # Start MongoDB
    echo "3️⃣  Starting MongoDB service..."
    sudo systemctl start mongod
    sudo systemctl enable mongod
    echo -e "${GREEN}✓${NC} MongoDB service started"
    echo ""

else
    echo -e "${RED}❌ Unsupported OS: $OS${NC}"
    echo "Please install MongoDB manually following the official documentation:"
    echo "https://docs.mongodb.com/manual/installation/"
    exit 1
fi

# Verify installation
echo "7️⃣  Verifying installation..."
if command -v mongosh &> /dev/null; then
    MONGO_VERSION=$(mongod --version | grep "db version" | cut -d " " -f 3)
    echo -e "${GREEN}✓${NC} MongoDB $MONGO_VERSION installed successfully"
elif command -v mongo &> /dev/null; then
    MONGO_VERSION=$(mongod --version | grep "db version" | cut -d " " -f 3)
    echo -e "${GREEN}✓${NC} MongoDB $MONGO_VERSION installed successfully"
else
    echo -e "${RED}❌ MongoDB installation verification failed${NC}"
    exit 1
fi
echo ""

# Create application database user (optional)
echo "🔐 Database Setup"
echo "================="
echo ""
read -p "Do you want to create a database user for the application? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    read -p "Enter database name [smart-coaching]: " DB_NAME
    DB_NAME=${DB_NAME:-smart-coaching}
    
    read -p "Enter username [smartcoaching_user]: " DB_USER
    DB_USER=${DB_USER:-smartcoaching_user}
    
    read -sp "Enter password (or press Enter to generate): " DB_PASS
    echo ""
    
    if [ -z "$DB_PASS" ]; then
        DB_PASS=$(openssl rand -base64 16)
        echo -e "${GREEN}✓${NC} Generated password: $DB_PASS"
    fi
    
    echo ""
    echo "Creating database user..."
    
    if command -v mongosh &> /dev/null; then
        mongosh --eval "
            use $DB_NAME;
            db.createUser({
                user: '$DB_USER',
                pwd: '$DB_PASS',
                roles: [{ role: 'readWrite', db: '$DB_NAME' }]
            });
        "
    else
        mongo --eval "
            use $DB_NAME;
            db.createUser({
                user: '$DB_USER',
                pwd: '$DB_PASS',
                roles: [{ role: 'readWrite', db: '$DB_NAME' }]
            });
        "
    fi
    
    echo ""
    echo -e "${GREEN}✓${NC} Database user created"
    echo ""
    echo "📝 Connection String:"
    echo "mongodb://$DB_USER:$DB_PASS@localhost:27017/$DB_NAME?authSource=$DB_NAME"
    echo ""
    echo "Add this to your .env.local file:"
    echo "MONGODB_URI=mongodb://$DB_USER:$DB_PASS@localhost:27017/$DB_NAME?authSource=$DB_NAME"
    echo ""
fi

# Summary
echo ""
echo "🎉 MongoDB Installation Complete!"
echo "================================="
echo ""
echo "✅ MongoDB is installed and running"
echo "✅ Service enabled (starts on boot)"
echo ""
echo "📋 Useful Commands:"
echo "  • Check status:    sudo systemctl status mongod"
echo "  • Stop MongoDB:    sudo systemctl stop mongod"
echo "  • Start MongoDB:   sudo systemctl start mongod"
echo "  • Restart MongoDB: sudo systemctl restart mongod"
echo "  • View logs:       sudo tail -f /var/log/mongodb/mongod.log"
echo ""
echo "🔗 Connect to MongoDB:"
echo "  • mongosh"
echo "  • mongosh mongodb://localhost:27017"
echo ""
echo "📚 Next Steps:"
echo "  1. Configure your .env.local file"
echo "  2. Run: npm run seed:admin"
echo "  3. Start your application: npm run dev"
echo ""
echo "📖 Full documentation: docs/MONGODB_SETUP_LINUX.md"
echo ""
