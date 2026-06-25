#!/bin/bash

# OS Simulator Compilation Script
# Compiles C++ code and generates Python library bindings.

echo "=========================================================="
echo " Starting OS Simulator C++ Module Compilation (macOS) "
echo "=========================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is not installed or not in PATH."
    exit 1
fi

# Determine python location
PYTHON_CMD="python3"
echo "Using Python: $($PYTHON_CMD --version)"

# Create a virtual environment if not present
if [ ! -d "venv" ]; then
    echo "Creating virtual environment 'venv'..."
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
source venv/bin/activate
echo "Virtual environment activated."

# Install required packages
echo "Installing dependencies from requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

# Compile the C++ extension in-place
echo "Compiling C++ sources using setup.py in-place..."
python setup.py build_ext --inplace

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================================="
    echo " SUCCESS: Module compiled successfully!"
    echo " Binary module is importable as 'os_sim_cpp'"
    echo "=========================================================="
    echo "To run the Streamlit app, execute:"
    echo "  source venv/bin/activate"
    echo "  streamlit run app.py"
    echo "=========================================================="
else
    echo "Error: Compilation failed. Check compiler outputs above."
    exit 1
fi
