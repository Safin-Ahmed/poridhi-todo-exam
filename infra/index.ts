import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create a VPC
const vpc = new aws.ec2.Vpc("my-vpc", {
    cidrBlock: "10.0.0.0/16",
    tags: {
        Name: "my-vpc"
    }
})

exports.vpcId = vpc.id 

const publicSubnet = new aws.ec2.Subnet("public-subnet", {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    availabilityZone: "ap-southeast-1a",
    mapPublicIpOnLaunch: true,
    tags: {
        Name: "my-public-subnet"
    }
})

exports.publicSubnetId = publicSubnet.id;

// Create a private subnet
const privateSubnet = new aws.ec2.Subnet("private-subnet", {
    vpcId: vpc.id,
    cidrBlock: "10.0.2.0/24",
    availabilityZone: "ap-southeast-1a",
    tags: {
        Name: "my-private-subnet"
    }
})
exports.privateSubnetId = privateSubnet.id;

// Internet gateway
const igw = new aws.ec2.InternetGateway("internet-gateway", {
    vpcId: vpc.id,
    tags: {
        Name: "my-internet-gateway"
    }
})

exports.igwId = igw.id;

// Create a public route table
const publicRouteTable = new aws.ec2.RouteTable("public-route-table", {
    vpcId: vpc.id,
    tags: {
        Name: "my-public-route-table"
    }
})

// Create a route in the route table for the internet gateway
const route = new aws.ec2.Route("igw-route", {
    routeTableId: publicRouteTable.id,
    destinationCidrBlock: "0.0.0.0/0",
    gatewayId: igw.id
})

// Associate the public route table with public subnet
const routeTableAssociation = new aws.ec2.RouteTableAssociation("public-route-table-association", {
    subnetId: publicSubnet.id,
    routeTableId: publicRouteTable.id
})

exports.publicRouteTableId = publicRouteTable.id

// Allocate an elastic ip for the nat gateway
const eip = new aws.ec2.Eip("nat-eip", {
    vpc: true
})

const natGateway = new aws.ec2.NatGateway("nat-gateway", {
    subnetId: publicSubnet.id,
    allocationId: eip.id,
    tags: {
        Name: "my-nat-gateway"
    }
})

exports.natGatewayId = natGateway.id

// Create private route table
const privateRouteTable = new aws.ec2.RouteTable("private-route-table", {
    vpcId: vpc.id,
    tags: {
        Name: "my-private-route-table"
    }
})

// Create a route in the route table for the NAT gateway
const privateRoute = new aws.ec2.Route("nat-route", {
    routeTableId: privateRouteTable.id,
    destinationCidrBlock: "0.0.0.0/0",
    natGatewayId: natGateway.id
})

// Private RT association
const privateRouteTableAssociation = new aws.ec2.RouteTableAssociation("private-route-table-association", {
    subnetId: privateSubnet.id,
    routeTableId: privateRouteTable.id
})

exports.privateRouteTableId = privateRouteTable.id;

// Frontend Security Group
const frontendSecurityGroup = new aws.ec2.SecurityGroup("frontend-sg", {
    vpcId: vpc.id,
    description: "Allow HTTP/HTTPS traffic",
    ingress: [
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] }, // HTTP
        { protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: ["0.0.0.0/0"] }, // HTTPS
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }, // Allow all outbound
    ],
});

// Backend Security Group
const backendSecurityGroup = new aws.ec2.SecurityGroup("backend-sg", {
    vpcId: vpc.id,
    description: "Allow traffic from Nginx",
    ingress: [
        { protocol: "tcp", fromPort: 4000, toPort: 4000, securityGroups: [frontendSecurityGroup.id] }, // Allow traffic from Nginx
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }, // Allow all outbound
    ],
});

// Database Security Group
const dbSecurityGroup = new aws.ec2.SecurityGroup("db-sg", {
    vpcId: vpc.id,
    description: "Allow traffic from backend instances",
    ingress: [
        { protocol: "tcp", fromPort: 5432, toPort: 5432, securityGroups: [backendSecurityGroup.id] }, // Allow traffic from backend
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }, // Allow all outbound
    ],
});

const dbInstance = new aws.ec2.Instance("db-instance", {
    ami: "ami-047126e50991d067b", 
    instanceType: "t2.micro",
    subnetId: privateSubnet.id,
    keyName: "exam", 
    securityGroups: [dbSecurityGroup.id],
    userData: `#!/bin/bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'admin123';"
sudo -u postgres psql -c "CREATE DATABASE mydatabase OWNER postgres;"
    `,
    tags: { Name: "PostgreSQL" },
});

// Export database details for backend
export const dbHost = dbInstance.privateIp;
export const dbPort = 5432; // Default PostgreSQL port
export const dbUser = "postgres";
export const dbPassword = "admin123";
export const dbName = "todo_db";

const backendInstances = [0, 1, 2].map((i) =>
    new aws.ec2.Instance(`backend-${i}`, {
        ami: "ami-047126e50991d067b", // Replace with region-specific Ubuntu AMI
        instanceType: "t2.micro",
        subnetId: privateSubnet.id,
        keyName: "exam", // Replace with your EC2 key pair
        securityGroups: [backendSecurityGroup.id],
        userData: `#!/bin/bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl start docker
sudo docker run -d -p 4000:4000 -e DB_HOST=${dbInstance.privateIp} -e DB_USER=postgres -e DB_PASSWORD=admin123 -e DB_NAME=todo_db -e JWT_SECRET=TODO_SECRET ehsafin/poridhi-exam-backend
        `,
        tags: { Name: `Backend-${i}` },
    })
);

// === NGINX LOAD BALANCER INSTANCE ===

const nginxInstance = new aws.ec2.Instance("nginx-load-balancer", {
    ami: "ami-047126e50991d067b",
    instanceType: "t2.micro",
    subnetId: publicSubnet.id,
    keyName: "exam", 
    securityGroups: [frontendSecurityGroup.id],
    userData: `#!/bin/bash
sudo apt update
sudo apt install -y nginx
cat <<EOT > /etc/nginx/conf.d/backend.conf
upstream backend {
    server ${backendInstances[0].privateIp}:4000;
    server ${backendInstances[1].privateIp}:4000;
    server ${backendInstances[2].privateIp}:4000;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOT
sudo systemctl restart nginx
    `,
    tags: { Name: "Nginx-Load-Balancer" },
});

// === FRONTEND INSTANCE ===

const frontendInstance = new aws.ec2.Instance("frontend", {
    ami: "ami-047126e50991d067b", // Replace with region-specific Ubuntu AMI
    instanceType: "t2.micro",
    subnetId: publicSubnet.id,
    keyName: "exam", // Replace with your EC2 key pair
    securityGroups: [frontendSecurityGroup.id],
    userData: `#!/bin/bash
# Update and install required packages
sudo apt update
sudo apt install -y docker.io nginx

# Start Docker
sudo systemctl start docker

# Run the frontend container on port 3000
sudo docker run -d -p 3000:3000 ehsafin/poridhi-exam-frontend

# Configure Nginx as a reverse proxy
cat <<EOT > /etc/nginx/sites-available/frontend
server {
    listen 80;

    location / {
        proxy_pass http://127.0.0.1:3000; # Redirect traffic to the frontend container
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOT

# Enable the Nginx configuration
ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/frontend
sudo nginx -t
sudo systemctl restart nginx
    `,
    tags: { Name: "Frontend" },
});

// === OUTPUTS ===
export const nginxPublicIp = nginxInstance.publicIp;
export const frontendPublicIp = frontendInstance.publicIp;