FROM node:20-slim as builder

WORKDIR /app

# Instalar dependencias de sistema (incluyendo openssl y curl)
RUN apt-get update && apt-get install -y openssl curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Instalar solo dependencias de producción
RUN apt-get update && apt-get install -y openssl curl

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built application and Prisma client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Healthcheck robusto usando Node.js (no depende de curl)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');const req=http.request({host:'localhost',port:3000,path:'/health'},res=>{process.exit(res.statusCode===200?0:1)});req.on('error',()=>process.exit(1));req.end();"

# Start the application
CMD ["npm", "start"]