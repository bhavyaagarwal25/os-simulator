# C++ Core Heuristics OS Simulator (Pybind11 & Streamlit)

This module implements the core process scheduling algorithms and Banker's safety checking logic in performance-critical C++, binds them to Python using `pybind11`, and presents them through an interactive, premium Streamlit dashboard.

---

## Technical Stack
- **C++ Core Engine**: Implements the memory structure, process structures, CPU scheduler loop, and Banker's safety state solver.
- **Pybind11 bindings**: Exposes C++ structs (`Process`, `SchedulerResult`, `BankersResult`) and classes (`Scheduler`, `Bankers`) directly to Python as a importable binary extension module (`os_sim_cpp`).
- **Python Streamlit UI**: Standard interactive widgets allowing workload generation, matrix manipulations, and rendering Gantt execution charts and terminal outputs.

---

## File Layout

- `src/scheduler.h` & `src/scheduler.cpp`: C++ classes representing CPU scheduler loop.
- `src/bankers.h` & `src/bankers.cpp`: C++ class representing Banker's algorithm logic.
- `src/bindings.cpp`: Pybind11 bindings exposing these C++ modules.
- `setup.py`: Build script utilizing `setuptools` to compile C++ source files in place.
- `compile.sh`: Automated shell script to create virtual environments, install dependencies, compile bindings, and launch the application.
- `app.py`: Streamlit dashboard layout importing `os_sim_cpp` and displaying outputs.

---

## Getting Started (Quick Run)

If you are on macOS or Linux with a C++ compiler (like Clang/GCC) installed, simply run the automated compilation script:

```bash
chmod +x compile.sh
./compile.sh
```

This will automatically:
1. Initialize a Python virtual environment `venv`
2. Install dependencies (Streamlit, Pybind11, setuptools, pandas)
3. Compile the C++ extension in-place (creating a `.so` binary in the directory)
4. Tell you how to run the Streamlit dashboard!

---

## Manual Execution Steps

If you want to run the steps individually:

1. **Create and Activate Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Compile C++ Module in Place**:
   ```bash
   python setup.py build_ext --inplace
   ```

4. **Launch Streamlit Dashboard**:
   ```bash
   streamlit run app.py
   ```
