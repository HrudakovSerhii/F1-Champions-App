#!/bin/bash

# F1 Champions App - Docker Startup Script
# This script provides a convenient way to start the Docker environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Main function
main() {
    log_header "🏎️  F1 Champions App - Docker Setup"
    echo ""

    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi

    # Check if docker-compose is available
    if ! command -v docker-compose >/dev/null 2>&1; then
        log_error "docker-compose is not installed. Please install Docker Desktop."
        exit 1
    fi

    # Setup environment file
    if [ ! -f "../.env" ]; then
        log_info "Creating .env file from template..."
        cp docker.env ../.env
        log_success ".env file created"
    else
        log_info ".env file already exists"
    fi

    # Parse command line arguments
    case "${1:-up}" in
        "up"|"start")
            start_services
            ;;
        "down"|"stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "logs")
            show_logs "${2:-}"
            ;;
        "status")
            show_status
            ;;
        "clean")
            clean_environment
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

start_services() {
    log_info "Starting F1 Champions App services..."
    
    # Build and start services
    cd .. && docker-compose up -d --build
    
    echo ""
    log_success "🚀 Services are starting up!"
    echo ""
    log_info "📋 Service URLs:"
    echo "   • Frontend:  http://localhost:3000"
    echo "   • Backend:   http://localhost:4000"
    echo "   • MongoDB:   mongodb://localhost:27000/f1_champions_local_db"
    echo ""
    log_info "⏳ Services may take a few minutes to fully initialize..."
    log_info "   Use 'docker-compose logs -f' to monitor startup progress"
    echo ""
    log_info "🔍 Check service status with: ./docker/docker-start.sh status"
}

stop_services() {
    log_info "Stopping F1 Champions App services..."
    cd .. && docker-compose down
    log_success "Services stopped"
}

restart_services() {
    log_info "Restarting F1 Champions App services..."
    cd .. && docker-compose restart
    log_success "Services restarted"
}

show_logs() {
    local service="$1"
    if [ -n "$service" ]; then
        log_info "Showing logs for service: $service"
        cd .. && docker-compose logs -f "$service"
    else
        log_info "Showing logs for all services (Ctrl+C to exit)"
        cd .. && docker-compose logs -f
    fi
}

show_status() {
    log_info "Service Status:"
    cd .. && docker-compose ps
    
    echo ""
    log_info "Health Checks:"
    
    # Check MongoDB
    if docker exec f1-mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        log_success "✅ MongoDB: Healthy"
    else
        log_warning "❌ MongoDB: Unhealthy"
    fi
    
    # Check Backend
    if curl -f http://localhost:4000/health >/dev/null 2>&1; then
        log_success "✅ Backend: Healthy"
    else
        log_warning "❌ Backend: Unhealthy"
    fi
    
    # Check Frontend
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        log_success "✅ Frontend: Healthy"
    else
        log_warning "❌ Frontend: Unhealthy"
    fi
}

clean_environment() {
    log_warning "This will remove all containers, volumes, and networks!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleaning Docker environment..."
        cd .. && docker-compose down -v --remove-orphans
        docker system prune -f
        log_success "Environment cleaned"
    else
        log_info "Operation cancelled"
    fi
}

show_help() {
    echo "F1 Champions App - Docker Management Script"
    echo ""
    echo "Usage: ./docker/docker-start.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up, start     Start all services (default)"
    echo "  down, stop    Stop all services"
    echo "  restart       Restart all services"
    echo "  logs [service] Show logs (optionally for specific service)"
    echo "  status        Show service status and health"
    echo "  clean         Remove all containers and volumes"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./docker/docker-start.sh                 # Start all services"
    echo "  ./docker/docker-start.sh logs backend    # Show backend logs"
    echo "  ./docker/docker-start.sh status          # Check service health"
    echo "  ./docker/docker-start.sh clean           # Clean everything"
    echo ""
    echo "Alternative Configurations:"
    echo "  # For production replica set (3 MongoDB nodes):"
    echo "  docker-compose -f docker/docker-compose-replica.yml up -d"
}

# Run main function
main "$@" 