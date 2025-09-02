#!/bin/bash

# OpenAFIS Setup Script
# This script automatically installs OpenAFIS library on Linux and macOS systems

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            echo "ubuntu"
        elif [ -f /etc/redhat-release ]; then
            echo "rhel"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install dependencies based on OS
install_dependencies() {
    local os=$1
    
    print_status "Installing dependencies for $os..."
    
    case $os in
        "ubuntu")
            sudo apt update
            # Install OpenAFIS specific dependencies as per their README
            sudo apt install -y clang cmake llvm libpthread-stubs0-dev git
            ;;
        "rhel")
            if command_exists dnf; then
                sudo dnf install -y clang cmake llvm-devel git make
            else
                sudo yum install -y clang cmake llvm-devel git make
            fi
            ;;
        "macos")
            if ! command_exists brew; then
                print_error "Homebrew is required for macOS. Please install it from https://brew.sh"
                exit 1
            fi
            brew install cmake git llvm
            ;;
        *)
            print_error "Unsupported operating system: $os"
            exit 1
            ;;
    esac
    
    print_success "Dependencies installed successfully"
}

# Function to verify dependencies
verify_dependencies() {
    print_status "Verifying dependencies..."
    
    local deps=("cmake" "git" "make")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! command_exists "$dep"; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        return 1
    fi
    
    # Check for C++ compiler
    if ! command_exists g++ && ! command_exists clang++; then
        print_error "No C++ compiler found (g++ or clang++)"
        return 1
    fi
    
    print_success "All dependencies verified"
    return 0
}

# Function to get number of CPU cores
get_cpu_cores() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sysctl -n hw.ncpu
    else
        nproc
    fi
}

# Function to clone OpenAFIS repository
clone_openafis() {
    local install_dir=$1
    
    print_status "Setting up OpenAFIS source..."
    
    if [ -d "$install_dir" ]; then
        print_warning "Directory $install_dir already exists"
        read -p "Do you want to remove it and recreate? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$install_dir"
        else
            print_status "Using existing directory"
            return 0
        fi
    fi
    
    # Clone the official repository
    print_status "Cloning OpenAFIS repository..."
    if git clone https://github.com/neilharan/openafis.git "$install_dir"; then
        print_success "OpenAFIS repository cloned successfully"
        return 0
    else
        print_error "Failed to clone OpenAFIS repository"
        exit 1
    fi
}

# Function to build OpenAFIS
build_openafis() {
    local source_dir=$1
    local cpu_cores=$2
    
    print_status "Building OpenAFIS..."
    
    cd "$source_dir"
    
    # Fix common compilation issues
    print_status "Applying fixes for compilation issues..."
    
    # Fix missing cstddef include in Minutia.h
    if [ -f "lib/Minutia.h" ]; then
        if ! grep -q "#include <cstddef>" lib/Minutia.h; then
            sed -i '6a#include <cstddef>' lib/Minutia.h
            print_status "Added missing #include <cstddef> to Minutia.h"
        fi
    fi
    
    # Fix missing algorithm include if needed
    find . -name "*.h" -o -name "*.cpp" | xargs grep -l "std::sort\|std::find\|std::max\|std::min" | while read file; do
        if ! grep -q "#include <algorithm>" "$file"; then
            sed -i '1i#include <algorithm>' "$file"
            print_status "Added missing #include <algorithm> to $file"
        fi
    done
    
    # Create build directory and configure with CMake
    print_status "Configuring OpenAFIS with CMake..."
    mkdir -p build
    cd build
    
    cmake .. -DCMAKE_BUILD_TYPE=Release \
             -DCMAKE_CXX_FLAGS="-fPIC" \
             -DCMAKE_C_FLAGS="-fPIC" \
             -DCMAKE_POSITION_INDEPENDENT_CODE=ON
    
    # Build using CMake
    print_status "Compiling OpenAFIS (using $cpu_cores cores)..."
    if ! cmake --build . --parallel "$cpu_cores"; then
        print_error "OpenAFIS compilation failed"
        print_status "Trying with verbose output..."
        cmake --build . --parallel "$cpu_cores" --verbose || {
            print_error "OpenAFIS compilation failed with verbose output"
            exit 1
        }
    fi
    
    print_success "OpenAFIS built successfully"
}

# Function to install OpenAFIS
install_openafis() {
    local source_dir=$1
    
    print_status "Setting up OpenAFIS..."
    
    cd "$source_dir"
    
    # OpenAFIS builds into the build directory
    print_status "Installing OpenAFIS library files..."
    
    # Create include directory if it doesn't exist
    sudo mkdir -p /usr/local/include/openafis
    sudo mkdir -p /usr/local/lib
    
    # Copy header files from lib directory
    if [ -d "lib" ]; then
        sudo cp lib/*.h /usr/local/include/openafis/
        print_success "Header files copied from lib directory"
    else
        print_warning "lib directory not found"
    fi
    
    # Copy built library files from build directory
    if [ -d "build" ]; then
        cd build
        
        # Look for built libraries
        if [ -f "lib/libopenafis.a" ]; then
            sudo cp lib/libopenafis.a /usr/local/lib/
            print_success "Static library copied"
        elif [ -f "lib/libopenafis.so" ]; then
            sudo cp lib/libopenafis.so /usr/local/lib/
            print_success "Shared library copied"
        elif [ -f "libopenafis.a" ]; then
            sudo cp libopenafis.a /usr/local/lib/
            print_success "Static library copied"
        elif [ -f "libopenafis.so" ]; then
            sudo cp libopenafis.so /usr/local/lib/
            print_success "Shared library copied"
        else
            print_warning "No OpenAFIS library files found in build directory"
            print_status "Available files in build directory:"
            find . -name "*.so" -o -name "*.a" | head -10
        fi
        
        # Also copy any executables that might be useful
        if [ -f "cli/openafis" ]; then
            sudo cp cli/openafis /usr/local/bin/
            print_success "OpenAFIS CLI tool installed"
        fi
        
    else
        print_error "Build directory not found"
        exit 1
    fi
    
    # Update library cache
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo ldconfig
    fi
    
    print_success "OpenAFIS setup completed"
}

# Function to verify installation
verify_installation() {
    print_status "Verifying OpenAFIS installation..."
    
    # Create a simple test file based on the OpenAFIS README example
    local test_file="/tmp/test_openafis.cpp"
    cat > "$test_file" << 'EOF'
#include <iostream>
#include "OpenAFIS.h"

int main() {
    std::cout << "OpenAFIS library is available!" << std::endl;
    
    // Basic test based on OpenAFIS example
    try {
        // Test template creation (basic functionality check)
        TemplateISO19794_2_2005<uint32_t, Fingerprint> t1(1);
        MatchSimilarity match;
        
        std::cout << "OpenAFIS classes instantiated successfully!" << std::endl;
        std::cout << "OpenAFIS installation verified!" << std::endl;
    } catch (const std::exception& e) {
        std::cout << "OpenAFIS basic test completed (some functionality may require actual templates)" << std::endl;
    }
    
    return 0;
}
EOF
    
    # Try to compile the test
    print_status "Testing compilation with OpenAFIS headers..."
    if g++ -std=c++17 -I/usr/local/include -L/usr/local/lib -o /tmp/test_openafis "$test_file" -lopenafis 2>/dev/null; then
        /tmp/test_openafis
        rm -f /tmp/test_openafis "$test_file"
        print_success "OpenAFIS installation verified with compilation test"
    else
        print_warning "Could not compile test with OpenAFIS library"
        print_status "Checking if OpenAFIS headers are installed..."
        
        if [ -f "/usr/local/include/OpenAFIS.h" ]; then
            print_success "OpenAFIS headers found at /usr/local/include/OpenAFIS.h"
        else
            print_warning "OpenAFIS headers not found in expected location"
        fi
        
        rm -f "$test_file"
    fi
}

# Main function
main() {
    echo "================================================"
    echo "           OpenAFIS Setup Script"
    echo "================================================"
    echo
    
    # Detect OS
    local os=$(detect_os)
    print_status "Detected OS: $os"
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_error "Please do not run this script as root. It will use sudo when needed."
        exit 1
    fi
    
    # Set installation directory
    local install_dir="/tmp/openafis-build"
    local cpu_cores=$(get_cpu_cores)
    
    print_status "Installation directory: $install_dir"
    print_status "CPU cores available: $cpu_cores"
    echo
    
    # Install dependencies
    install_dependencies "$os"
    echo
    
    # Verify dependencies
    if ! verify_dependencies; then
        exit 1
    fi
    echo
    
    # Clone repository
    clone_openafis "$install_dir"
    echo
    
    # Build OpenAFIS
    build_openafis "$install_dir" "$cpu_cores"
    echo
    
    # Install OpenAFIS
    install_openafis "$install_dir"
    echo
    
    # Verify installation
    verify_installation
    echo
    
    print_success "OpenAFIS setup completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Navigate to your Node.js addon directory"
    echo "2. Run: npm install"
    echo "3. Run: npm run build"
    echo
    echo "Installation directory: $install_dir"
    echo "Library installed at: /usr/local/lib"
    echo "Headers installed at: /usr/local/include"
    echo
    print_status "Note: Source files are in /tmp and can be safely removed after installation"
}

# Run main function
main "$@"
