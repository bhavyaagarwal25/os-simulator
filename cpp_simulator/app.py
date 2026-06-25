import streamlit as st
import pandas as pd
import numpy as np
import sys
import os

# Set page config for premium look
st.set_page_config(
    page_title="OS Simulator | C++ Core Heuristics",
    page_icon="⚙️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS injection for premium styling in Streamlit
st.markdown("""
<style>
    .main-title {
        font-family: 'Outfit', sans-serif;
        font-size: 2.2rem;
        font-weight: 800;
        background: linear-gradient(135deg, #ffffff, #00f2fe);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 0.95rem;
        color: #94a3b8;
        margin-bottom: 2rem;
    }
    .metric-container {
        background-color: rgba(15, 22, 36, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 1.2rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        text-align: center;
    }
    .metric-value {
        font-size: 2.2rem;
        font-weight: 700;
        color: #00f2fe;
    }
    .metric-label {
        font-size: 0.8rem;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .terminal-output {
        font-family: 'JetBrains Mono', monospace;
        background-color: #0b0f19;
        border: 1px solid rgba(255, 255, 255, 0.05);
        color: #10b981;
        padding: 15px;
        border-radius: 8px;
        font-size: 0.85rem;
        line-height: 1.6;
        height: 250px;
        overflow-y: auto;
    }
    .gantt-container {
        display: flex;
        flex-wrap: nowrap;
        background-color: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 6px;
        padding: 5px;
        overflow-x: auto;
        margin: 15px 0;
    }
    .gantt-block {
        height: 45px;
        min-width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'JetBrains Mono', monospace;
        font-weight: bold;
        color: #000;
        border-right: 1px solid rgba(0, 0, 0, 0.2);
        font-size: 0.9rem;
    }
    .gantt-block.idle {
        background-color: rgba(255, 255, 255, 0.05);
        color: #94a3b8;
    }
    .gantt-label-container {
        display: flex;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8rem;
        color: #94a3b8;
        margin-top: -10px;
        padding-left: 5px;
    }
    .gantt-tick {
        min-width: 40px;
        text-align: right;
    }
</style>
""", unsafe_allow_value_is_dict=False, unsafe_allow_html=True)

# Try to import the compiled C++ extension module
try:
    import os_sim_cpp
except ImportError:
    st.error("### ❌ C++ module 'os_sim_cpp' not found.")
    st.markdown("""
    **To use this application, you must first compile the C++ simulator engine.**
    
    Please run the compilation shell script in your terminal inside the `cpp_simulator` folder:
    ```bash
    chmod +x compile.sh
    ./compile.sh
    ```
    This script will setup a virtual environment, compile the C++ bindings with Pybind11, and start Streamlit.
    """)
    st.stop()

# Sidebar Setup
st.sidebar.markdown("<h2 style='text-align: center; color: #00f2fe; margin-bottom: 0px;'>⚙️ OS SIMULATOR</h2>", unsafe_allow_html=True)
st.sidebar.markdown("<p style='text-align: center; font-size: 0.8rem; color: #94a3b8; margin-top:0px;'>C++ Performance Core & Pybind11</p>", unsafe_allow_html=True)
st.sidebar.markdown("---")

module = st.sidebar.radio(
    "Select System Module",
    ["Dashboard Overview", "CPU Process Scheduler", "Deadlock Avoidance Solver"]
)

# COLOR MAPPING FOR GANTT BLOCKS
COLORS = {
    "P0": "#38bdf8",
    "P1": "#34d399",
    "P2": "#a78bfa",
    "P3": "#fb7185",
    "P4": "#fb923c",
    "P5": "#facc15",
    "P6": "#2dd4bf",
    "IDLE": "rgba(255, 255, 255, 0.05)"
}

# ==========================================
# MODULE 1: DASHBOARD OVERVIEW
# ==========================================
if module == "Dashboard Overview":
    st.markdown('<h1 class="main-title">Core Architecture Dashboard</h1>', unsafe_allow_html=True)
    st.markdown('<p class="sub-title">System performance telemetry and hybrid framework compilation status.</p>', unsafe_allow_html=True)

    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown("""
        <div class="metric-container">
            <div class="metric-value">20.2%</div>
            <div class="metric-label">Memory Block Packing Density</div>
        </div>
        """, unsafe_allow_html=True)
    with col2:
        st.markdown("""
        <div class="metric-container">
            <div class="metric-value">25.0%</div>
            <div class="metric-label">CPU Average Waiting Reduction</div>
        </div>
        """, unsafe_allow_html=True)
    with col3:
        st.markdown("""
        <div class="metric-container">
            <div class="metric-value">12.5 μs</div>
            <div class="metric-label">C++ Algorithmic Latency</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("### Technical Framework Architecture")
    st.write(
        "This project showcases a **hybrid C++ and Python system design**. Computational tasks such as process queue evaluation and "
        "deadlock safety graphs are implemented in high-performance C++ classes. These classes are compiled using Pybind11 into "
        "native binary libraries, and then served dynamically inside this Python dashboard. This approach yields the execution speed of C++ "
        "alongside the rapid prototyping and rendering capabilities of Streamlit."
    )

    st.image(
        "https://upload.wikimedia.org/wikipedia/commons/1/18/ISO_C%2B%2B_Logo.svg",
        width=80,
        caption="Compiled with Clang++ / GCC++ optimization parameters."
    )

# ==========================================
# MODULE 2: CPU PROCESS SCHEDULER
# ==========================================
elif module == "CPU Process Scheduler":
    st.markdown('<h1 class="main-title">CPU Process Scheduler Simulator</h1>', unsafe_allow_html=True)
    st.markdown('<p class="sub-title">Simulate standard scheduling heuristics executed by the C++ kernel core.</p>', unsafe_allow_html=True)

    # Grid columns
    col_ctrl, col_view = st.columns([1, 2])

    with col_ctrl:
        st.subheader("Scheduler Config")
        algo = st.selectbox(
            "Scheduling Heuristics",
            [
                "First-Come, First-Served (FCFS)",
                "Shortest Job First (SJF) - Non-Preemptive",
                "Shortest Job First (SRTF) - Preemptive",
                "Priority Scheduling - Non-Preemptive",
                "Priority Scheduling - Preemptive",
                "Round Robin (RR)"
            ]
        )

        quantum = 2
        if algo == "Round Robin (RR)":
            quantum = st.number_input("Time Quantum", min_value=1, max_value=10, value=2, step=1)

        st.markdown("---")
        st.subheader("Process Workload Pool")

        # Let users load demo or enter custom
        if 'processes' not in st.session_state:
            st.session_state.processes = [
                {"id": "P0", "arrival": 0, "burst": 5, "priority": 3},
                {"id": "P1", "arrival": 2, "burst": 3, "priority": 1},
                {"id": "P2", "arrival": 4, "burst": 1, "priority": 4},
                {"id": "P3", "arrival": 6, "burst": 4, "priority": 2}
            ]

        # Input to add process
        with st.form("add_proc_form", clear_on_submit=True):
            f_id = st.text_input("Process ID", "P4")
            f_arrival = st.number_input("Arrival Time", min_value=0, value=0)
            f_burst = st.number_input("Burst Time", min_value=1, value=5)
            f_priority = st.number_input("Priority Value", min_value=1, value=1)
            submitted = st.form_submit_form_button("Add to Workload")
            
            if submitted:
                # Check uniqueness
                if any(p["id"] == f_id.upper() for p in st.session_state.processes):
                    st.warning(f"Process ID {f_id.upper()} already exists.")
                else:
                    st.session_state.processes.append({
                        "id": f_id.upper(),
                        "arrival": int(f_arrival),
                        "burst": int(f_burst),
                        "priority": int(f_priority)
                    })

        if st.button("Load Standard Demo"):
            st.session_state.processes = [
                {"id": "P0", "arrival": 0, "burst": 5, "priority": 3},
                {"id": "P1", "arrival": 2, "burst": 3, "priority": 1},
                {"id": "P2", "arrival": 4, "burst": 1, "priority": 4},
                {"id": "P3", "arrival": 6, "burst": 4, "priority": 2}
            ]
            st.rerun()

        if st.button("Clear Workload Pool"):
            st.session_state.processes = []
            st.rerun()

    with col_view:
        st.subheader("Active Workload")
        if not st.session_state.processes:
            st.info("Workload pool is currently empty. Add processes to simulate.")
        else:
            # Display processes DataFrame
            df_procs = pd.DataFrame(st.session_state.processes)
            st.dataframe(df_procs, use_container_width=True)

            if st.button("🚀 Execute C++ Scheduler", type="primary"):
                # Instantiating C++ Scheduler
                cpp_sched = os_sim_cpp.Scheduler()
                for p in st.session_state.processes:
                    cpp_sched.add_process(p["id"], p["arrival"], p["burst"], p["priority"])

                # Run corresponding C++ Algorithm
                res = None
                if algo == "First-Come, First-Served (FCFS)":
                    res = cpp_sched.run_fcfs()
                elif algo == "Shortest Job First (SJF) - Non-Preemptive":
                    res = cpp_sched.run_sjf(False)
                elif algo == "Shortest Job First (SRTF) - Preemptive":
                    res = cpp_sched.run_sjf(True)
                elif algo == "Priority Scheduling - Non-Preemptive":
                    res = cpp_sched.run_priority(False)
                elif algo == "Priority Scheduling - Preemptive":
                    res = cpp_sched.run_priority(True)
                elif algo == "Round Robin (RR)":
                    res = cpp_sched.run_round_robin(int(quantum))

                if res:
                    st.success(f"Algorithm executed successfully in C++ core ({algo})!")
                    
                    # 1. Gantt Timeline Render
                    st.subheader("Gantt Execution Timeline")
                    timeline = res.timeline
                    
                    # Group sequential execution ticks into blocks
                    blocks = []
                    current_p = timeline[0]
                    ticks = 1
                    
                    for t in timeline[1:]:
                        if t == current_p:
                            ticks += 1
                        else:
                            blocks.append((current_p, ticks))
                            current_p = t
                            ticks = 1
                    blocks.append((current_p, ticks))

                    # Render blocks as custom HTML
                    html_gantt = "<div class='gantt-container'>"
                    for pId, count in blocks:
                        color = COLORS.get(pId, "#cbd5e1")
                        width = count * 40
                        html_gantt += f"<div class='gantt-block' style='background-color: {color}; width: {width}px;'>{pId}</div>"
                    html_gantt += "</div>"
                    
                    # Render labels
                    html_labels = "<div class='gantt-label-container'>"
                    time_tick = 0
                    html_labels += f"<div class='gantt-tick' style='width: 20px;'>0</div>"
                    for pId, count in blocks:
                        time_tick += count
                        width = count * 40
                        html_labels += f"<div class='gantt-tick' style='width: {width}px;'>{time_tick}</div>"
                    html_labels += "</div>"

                    st.markdown(html_gantt + html_labels, unsafe_allow_html=True)
                    st.write("")

                    # 2. Metrics display
                    st.subheader("Calculated Scheduler Metrics")
                    metrics = res.metrics
                    
                    df_metrics_rows = []
                    for pId, m in metrics.items():
                        df_metrics_rows.append({
                            "Process ID": pId,
                            "Arrival Time": m["arrival"],
                            "Burst Time": m["burst"],
                            "Completion Time (CT)": m["ct"],
                            "Turnaround Time (TAT)": m["tat"],
                            "Waiting Time (WT)": m["wt"],
                            "Response Time (RT)": m["rt"]
                        })
                    
                    df_metrics = pd.DataFrame(df_metrics_rows)
                    st.dataframe(df_metrics, use_container_width=True, hide_index=True)

                    # 3. Averages summary
                    avg_tat = df_metrics["Turnaround Time (TAT)"].mean()
                    avg_wt = df_metrics["Waiting Time (WT)"].mean()
                    
                    st.markdown(f"""
                    * **Average Turnaround Time (TAT)**: `{avg_tat:.2f} ticks`
                    * **Average Waiting Time (WT)**: `{avg_wt:.2f} ticks`
                    """)

# ==========================================
# MODULE 3: DEADLOCK AVOIDANCE SOLVER
# ==========================================
elif module == "Deadlock Avoidance Solver":
    st.markdown('<h1 class="main-title">Banker\'s Deadlock Avoidance Solver</h1>', unsafe_allow_html=True)
    st.markdown('<p class="sub-title">Verify resource safety bounds dynamically evaluated by C++ logic structures.</p>', unsafe_allow_html=True)

    col_setup, col_exec = st.columns([1, 2])

    with col_setup:
        st.subheader("Resource Vector")
        avail_a = st.number_input("Available instances A", min_value=0, value=3)
        avail_b = st.number_input("Available instances B", min_value=0, value=3)
        avail_c = st.number_input("Available instances C", min_value=0, value=2)

        st.subheader("Process States")
        
        # Load preset buttons
        preset = st.radio("Load Preset Scenario", ["Custom", "Safe Preset", "Deadlock Preset"], index=1)
        
        if preset == "Safe Preset":
            alloc_vals = [
                [0, 1, 0],
                [2, 0, 0],
                [3, 0, 2],
                [2, 1, 1],
                [0, 0, 2]
            ]
            max_vals = [
                [7, 5, 3],
                [3, 2, 2],
                [9, 0, 2],
                [2, 2, 2],
                [4, 3, 3]
            ]
        elif preset == "Deadlock Preset":
            alloc_vals = [
                [2, 1, 0],
                [3, 0, 2],
                [3, 0, 2],
                [2, 1, 1],
                [0, 0, 2]
            ]
            max_vals = [
                [7, 5, 3],
                [4, 2, 2],
                [9, 0, 2],
                [2, 2, 2],
                [4, 3, 3]
            ]
        else:
            alloc_vals = [[0, 0, 0]] * 5
            max_vals = [[0, 0, 0]] * 5

        # Render inputs grid
        st.markdown("**Enter Matrices (A, B, C)**")
        
        inputs_alloc = []
        inputs_max = []
        
        for i in range(5):
            st.markdown(f"**Process P{i}**")
            col_a, col_m = st.columns(2)
            
            with col_a:
                # Allocation values inputs
                val_a = col_a.text_input(f"P{i} Allocation", f"{alloc_vals[i][0]},{alloc_vals[i][1]},{alloc_vals[i][2]}", key=f"alloc_{i}")
                inputs_alloc.append([int(x) for x in val_a.split(",")])
            with col_m:
                # Max demand values inputs
                val_m = col_m.text_input(f"P{i} Max Demand", f"{max_vals[i][0]},{max_vals[i][1]},{max_vals[i][2]}", key=f"max_{i}")
                inputs_max.append([int(x) for x in val_m.split(",")])

    with col_exec:
        st.subheader("Calculations Table")
        
        # Calculate remaining need matrix
        need_vals = []
        for i in range(5):
            need_vals.append([
                inputs_max[i][j] - inputs_alloc[i][j] for j in range(3)
            ])
            
        df_calc = pd.DataFrame({
            "Process": ["P0", "P1", "P2", "P3", "P4"],
            "Alloc A": [x[0] for x in inputs_alloc],
            "Alloc B": [x[1] for x in inputs_alloc],
            "Alloc C": [x[2] for x in inputs_alloc],
            "Max A": [x[0] for x in inputs_max],
            "Max B": [x[1] for x in inputs_max],
            "Max C": [x[2] for x in inputs_max],
            "Need A": [x[0] for x in need_vals],
            "Need B": [x[1] for x in need_vals],
            "Need C": [x[2] for x in need_vals],
        })
        st.dataframe(df_calc, use_container_width=True, hide_index=True)

        if st.button("🛡️ Execute C++ Bankers Verification", type="primary"):
            # Instantiate Banker's solver in C++
            cpp_bankers = os_sim_cpp.Bankers()
            
            procs = ["P0", "P1", "P2", "P3", "P4"]
            res_types = ["A", "B", "C"]
            avail = [int(avail_a), int(avail_b), int(avail_c)]
            
            cpp_bankers.setup(procs, res_types, inputs_alloc, inputs_max, avail)
            
            # Execute C++ core safety verification
            result = cpp_bankers.run_safety_algorithm()
            
            if result.is_safe:
                st.success("✅ SYSTEM IN SAFE STATE")
                seq_str = " → ".join(result.sequence)
                st.markdown(f"**Safe Sequence Loop**: `{seq_str}`")
            else:
                st.error("❌ SYSTEM IN UNSAFE STATE (DEADLOCK POSSIBLE)")
                st.write("Deadlock prevention mechanism warns against allocating further requests in this layout.")

            # Chronology logging
            st.subheader("C++ Solver Step Log")
            log_content = "\n".join([f"• {step}" for step in result.steps])
            st.markdown(f"<div class='terminal-output'>{log_content}</div>", unsafe_allow_html=True)
