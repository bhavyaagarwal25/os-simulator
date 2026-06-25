# Quick test script to verify C++ bindings
import sys
import os

# Append the directory containing compiled module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import os_sim_cpp
    print("SUCCESS: Imported os_sim_cpp successfully!")
except ImportError as e:
    print(f"FAILED: Cannot import os_sim_cpp. Error: {e}")
    sys.exit(1)

# 1. Test Scheduler
print("\n--- Testing CPU Scheduler ---")
sched = os_sim_cpp.Scheduler()
sched.add_process("P0", 0, 5, 3)
sched.add_process("P1", 2, 3, 1)
sched.add_process("P2", 4, 1, 4)

print("Running Preemptive SJF (SRTF)...")
res = sched.run_sjf(True)
print("Timeline:", res.timeline)
print("Metrics:")
for p_id, m in res.metrics.items():
    print(f"  {p_id}: CT={m['ct']}, TAT={m['tat']}, WT={m['wt']}, RT={m['rt']}")

assert res.timeline == ['P0', 'P0', 'P0', 'P0', 'P0', 'P2', 'P1', 'P1', 'P1'], f"Unexpected preemptive SJF result: {res.timeline}"
print("Scheduler verification SUCCESSFUL!")

# 2. Test Bankers
print("\n--- Testing Bankers Safety Algorithm ---")
bankers = os_sim_cpp.Bankers()

procs = ["P0", "P1", "P2", "P3", "P4"]
res_types = ["A", "B", "C"]
avail = [3, 3, 2]
alloc = [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2]
]
max_need = [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3]
]

bankers.setup(procs, res_types, alloc, max_need, avail)
res = bankers.run_safety_algorithm()

print("Is Safe:", res.is_safe)
print("Sequence:", res.sequence)
print("Steps count:", len(res.steps))

assert res.is_safe == True, "Expected state to be safe"
assert "P1" in res.sequence, "Expected P1 to be in safe sequence"
print("Bankers verification SUCCESSFUL!")

print("\nAll C++ bindings tests completed successfully!")
