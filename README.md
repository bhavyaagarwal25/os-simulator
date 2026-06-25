# OS Simulator (Operating System Simulator)

An interactive, high-fidelity Operating System Simulator built to model process scheduling, memory management, and deadlock avoidance. This repository features two implementations:

1. **Interactive Web Dashboard**: A zero-dependency, premium web application built with vanilla HTML, CSS, and JavaScript. It provides real-time animated visualizations, dynamic Gantt charts, interactive ready queues, memory grids, and safety checkers.
2. **C++ & Pybind11 Streamlit App**: A hybrid application combining performance-critical C++ algorithms with a clean Streamlit interface via `pybind11` Python bindings.

---

## Key Features

### 1. Process Scheduler
- **Algorithms**: First-Come First-Served (FCFS), Shortest Job First (SJF, preemptive & non-preemptive), Round Robin (RR) with configurable quantum, and Priority (preemptive & non-preemptive).
- **Visualizations**: Animated Ready Queue cards, live CPU core execution panel, real-time incremental Gantt Chart, and an auto-updating performance metrics table (Completion Time, Turnaround Time, Waiting Time, Response Time).

### 2. Memory Manager
- **Dynamic Allocation**: Simulate memory partitioning and allocation requests using **First Fit**, **Best Fit**, or **Worst Fit**. Visualizes internal fragmentation and free-space coalescing with a scanning pointer animation.
- **Page Replacement**: Simulates page frame memory using **FIFO**, **LRU**, and **Optimal** page replacement algorithms, displaying step-by-step frame state tables with green/red hit-and-miss indicators.

### 3. Deadlock Avoidance
- **Banker's Algorithm**: Models resource allocation safety. Enter resource instances and Allocation/Max matrices, then watch the safety check evaluate each process step-by-step to construct a Safe Sequence or detect a deadlock.

---

## Directory Structure

```
os-simulator/
├── index.html            # Web Dashboard layout
├── styles.css            # Custom CSS for dark-mode, glassmorphism, animations
├── app.js                # Core UI events, timer loops, and simulation manager
├── algorithms.js         # JavaScript implementation of the simulated algorithms
├── README.md             # Project documentation (this file)
└── cpp_simulator/        # C++ / Pybind11 / Streamlit implementation
    ├── src/
    │   ├── scheduler.h    # C++ Scheduling Headers
    │   ├── scheduler.cpp  # C++ Scheduling Implementation
    │   ├── bankers.h      # C++ Banker's Headers
    │   ├── bankers.cpp    # C++ Banker's Implementation
    │   └── bindings.cpp   # Pybind11 bindings exposing classes to Python
    ├── app.py            # Streamlit dashboard calling the C++ library
    ├── setup.py          # Python setup script to build & compile C++ modules
    ├── compile.sh        # Quick compilation script for macOS
    ├── requirements.txt  # Python package requirements
    └── README.md         # Compilation & build instructions
```

---

## Quick Start (Web Dashboard)

Simply double-click `index.html` or host the root folder using a local web server (e.g. `python3 -m http.server 8000`) and open `http://localhost:8000` in your web browser.

---

## Quick Start (C++ / Streamlit)

For details on how to build the C++ simulator and run the Streamlit dashboard, please refer to the [cpp_simulator/README.md](file:///Users/bhavyaagarwal/.gemini/antigravity/scratch/os-simulator/cpp_simulator/README.md) file.
