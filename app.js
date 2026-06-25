/**
 * OS Simulator - Core Application Manager
 * Coordinates UI updates, scheduling simulation clocks, memory grids, and safety testers.
 */

// State Holders
let activeTab = 'overview';
let activeSubTab = 'mem-allocation';

// CPU Scheduler State
let schedulerProcesses = [
    { id: 'P0', arrivalTime: 0, burstTime: 5, priority: 3 },
    { id: 'P1', arrivalTime: 2, burstTime: 3, priority: 1 },
    { id: 'P2', arrivalTime: 4, burstTime: 1, priority: 4 },
    { id: 'P3', arrivalTime: 6, burstTime: 4, priority: 2 }
];
let schedTimeline = [];
let schedMetrics = {};
let schedCurrentTime = 0;
let schedPlaybackInterval = null;
let schedIsPlaying = false;
let schedSpeed = 1;

// Memory Allocator State
let memoryCapacity = 550; // Total KB
let memoryBlocks = [
    { id: 'B1', start: 0, size: 100, allocatedProcessId: null, internalFragmentation: 0 },
    { id: 'B2', start: 100, size: 50, allocatedProcessId: null, internalFragmentation: 0 },
    { id: 'B3', start: 150, size: 200, allocatedProcessId: null, internalFragmentation: 0 },
    { id: 'B4', start: 350, size: 80, allocatedProcessId: null, internalFragmentation: 0 },
    { id: 'B5', start: 430, size: 120, allocatedProcessId: null, internalFragmentation: 0 }
];

// Banker's Algorithm State
let bankersProcesses = ['P0', 'P1', 'P2', 'P3', 'P4'];
let bankersResources = ['A', 'B', 'C'];
let bankersTotal = { A: 10, B: 5, C: 7 };
// Allocation matrix defaults
let bankersAllocation = [
    [0, 1, 0], // P0
    [2, 0, 0], // P1
    [3, 0, 2], // P2
    [2, 1, 1], // P3
    [0, 0, 2]  // P4
];
// Max need matrix defaults
let bankersMax = [
    [7, 5, 3], // P0
    [3, 2, 2], // P1
    [9, 0, 2], // P2
    [2, 2, 2], // P3
    [4, 3, 3]  // P4
];
let bankersAvailable = [3, 3, 2];

// ==========================================
// A. Tab & Layout Navigation
// ==========================================
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
    });
});

document.querySelectorAll('.sub-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const sub = btn.getAttribute('data-sub');
        switchSubTab(sub);
    });
});

function switchTab(tabId) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    
    const targetBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
    const targetPanel = document.getElementById(`panel-${tabId}`);
    
    if (targetBtn && targetPanel) {
        targetBtn.classList.add('active');
        targetPanel.classList.add('active');
        activeTab = tabId;
        
        // Update header titles
        const pageTitle = document.getElementById('page-title');
        const pageDesc = document.getElementById('page-desc');
        
        if (tabId === 'overview') {
            pageTitle.innerText = 'Dashboard Overview';
            pageDesc.innerText = 'System performance metrics and simulator controller overview.';
        } else if (tabId === 'scheduler') {
            pageTitle.innerText = 'CPU Process Scheduler';
            pageDesc.innerText = 'Simulate CPU process queue schedules using preemptive or non-preemptive priority heuristics.';
            resetSchedulerSim();
            renderSchedulerTable();
        } else if (tabId === 'memory') {
            pageTitle.innerText = 'Memory Manager Partitioning';
            pageDesc.innerText = 'Analyze memory block fragmentation or trace page frame reference hits and misses.';
            renderMemoryBlocks();
            updateMemoryStats();
            populateActiveProcessList();
        } else if (tabId === 'deadlock') {
            pageTitle.innerText = 'Deadlock Avoidance Analyzer';
            pageDesc.innerText = 'Verify safety state resource allocation parameters using Banker\'s algorithm.';
            renderBankersInputs();
            resetBankersResults();
        }
    }
}

function switchSubTab(subTabId) {
    document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
    
    const targetBtn = document.querySelector(`.sub-btn[data-sub="${subTabId}"]`);
    const targetPanel = document.getElementById(`subpanel-${subTabId}`);
    
    if (targetBtn && targetPanel) {
        targetBtn.classList.add('active');
        targetPanel.classList.add('active');
        activeSubTab = subTabId;
    }
}

// Global timer updater
function updateGlobalTimer(val) {
    document.getElementById('global-timer').innerText = Number(val).toFixed(2) + 's';
}

// ==========================================
// B. CPU Scheduler Module
// ==========================================

// Load demo processes
document.getElementById('btn-load-scheduler-demo').addEventListener('click', () => {
    schedulerProcesses = [
        { id: 'P0', arrivalTime: 0, burstTime: 5, priority: 3 },
        { id: 'P1', arrivalTime: 2, burstTime: 3, priority: 1 },
        { id: 'P2', arrivalTime: 4, burstTime: 1, priority: 4 },
        { id: 'P3', arrivalTime: 6, burstTime: 4, priority: 2 }
    ];
    resetSchedulerSim();
    renderSchedulerTable();
});

// Toggle Quantum Input for RR
document.getElementById('sched-algorithm').addEventListener('change', (e) => {
    const quantumGroup = document.getElementById('rr-quantum-group');
    if (e.target.value === 'rr') {
        quantumGroup.style.display = 'flex';
    } else {
        quantumGroup.style.display = 'none';
    }
    resetSchedulerSim();
});

// Form: Add process
document.getElementById('add-process-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('proc-id').value.trim().toUpperCase();
    const arrival = Number(document.getElementById('proc-arrival').value);
    const burst = Number(document.getElementById('proc-burst').value);
    const priority = Number(document.getElementById('proc-priority').value);
    
    if (!id) return;
    if (schedulerProcesses.some(p => p.id === id)) {
        alert('Process ID must be unique!');
        return;
    }
    
    schedulerProcesses.push({ id, arrivalTime: arrival, burstTime: burst, priority });
    renderSchedulerTable();
    resetSchedulerSim();
    
    // Clear input id
    document.getElementById('proc-id').value = '';
});

// Speed slider
document.getElementById('sched-speed').addEventListener('input', (e) => {
    schedSpeed = Number(e.target.value);
    document.getElementById('speed-label').innerText = schedSpeed + 'x';
    if (schedIsPlaying) {
        // Restart interval with new speed
        pauseSchedulerSim();
        playSchedulerSim();
    }
});

function renderSchedulerTable() {
    const tbody = document.getElementById('scheduler-table-body');
    tbody.innerHTML = '';
    
    schedulerProcesses.forEach((p, idx) => {
        const tr = document.createElement('tr');
        tr.id = `row-${p.id}`;
        
        const m = schedMetrics[p.id] || { ct: '--', tat: '--', wt: '--', rt: '--' };
        
        tr.innerHTML = `
            <td class="mono font-semibold">${p.id}</td>
            <td class="mono">${p.arrivalTime}</td>
            <td class="mono">${p.burstTime}</td>
            <td class="mono">${p.priority}</td>
            <td class="mono text-cyan" id="ct-${p.id}">${m.ct}</td>
            <td class="mono text-cyan" id="tat-${p.id}">${m.tat}</td>
            <td class="mono text-cyan" id="wt-${p.id}">${m.wt}</td>
            <td class="mono text-cyan" id="rt-${p.id}">${m.rt}</td>
            <td>
                <button class="btn btn-small btn-danger" onclick="deleteProcess(${idx})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteProcess(index) {
    schedulerProcesses.splice(index, 1);
    resetSchedulerSim();
    renderSchedulerTable();
}

// Reset scheduler variables
function resetSchedulerSim() {
    pauseSchedulerSim();
    schedCurrentTime = 0;
    schedTimeline = [];
    schedMetrics = {};
    updateGlobalTimer(0);
    
    // UI elements reset
    document.getElementById('cpu-active-proc').innerText = 'IDLE';
    document.getElementById('cpu-active-proc').parentElement.classList.remove('active');
    document.getElementById('cpu-progress').style.width = '0%';
    document.getElementById('cpu-time-left').innerText = '--';
    document.getElementById('ready-queue-list').innerHTML = '<div class="empty-queue-msg text-dim">Queue is empty</div>';
    document.getElementById('gantt-timeline').innerHTML = '';
    document.getElementById('gantt-labels').innerHTML = '';
    document.getElementById('avg-tat').innerText = '0.00';
    document.getElementById('avg-wt').innerText = '0.00';
    
    // Enable controls
    document.getElementById('btn-sched-run').disabled = false;
    document.getElementById('btn-sched-pause').disabled = true;
    document.getElementById('btn-sched-step').disabled = false;
    
    // Clear table values
    schedulerProcesses.forEach(p => {
        const ctCell = document.getElementById(`ct-${p.id}`);
        const tatCell = document.getElementById(`tat-${p.id}`);
        const wtCell = document.getElementById(`wt-${p.id}`);
        const rtCell = document.getElementById(`rt-${p.id}`);
        if (ctCell) ctCell.innerText = '--';
        if (tatCell) tatCell.innerText = '--';
        if (wtCell) wtCell.innerText = '--';
        if (rtCell) rtCell.innerText = '--';
        
        const row = document.getElementById(`row-${p.id}`);
        if (row) row.classList.remove('active-row');
    });
}

document.getElementById('btn-sched-reset').addEventListener('click', resetSchedulerSim);

// Run Scheduler Sim (Play)
document.getElementById('btn-sched-run').addEventListener('click', () => {
    if (schedulerProcesses.length === 0) {
        alert('Please add at least one process first.');
        return;
    }
    
    if (schedCurrentTime === 0) {
        // Compute the entire timeline
        const alg = document.getElementById('sched-algorithm').value;
        const quantum = Number(document.getElementById('sched-quantum').value);
        const results = runScheduler(alg, schedulerProcesses, quantum);
        schedTimeline = results.timeline;
        schedMetrics = results.metrics;
    }
    
    playSchedulerSim();
});

document.getElementById('btn-sched-pause').addEventListener('click', pauseSchedulerSim);

document.getElementById('btn-sched-step').addEventListener('click', () => {
    if (schedulerProcesses.length === 0) {
        alert('Please add at least one process first.');
        return;
    }
    
    if (schedCurrentTime === 0) {
        const alg = document.getElementById('sched-algorithm').value;
        const quantum = Number(document.getElementById('sched-quantum').value);
        const results = runScheduler(alg, schedulerProcesses, quantum);
        schedTimeline = results.timeline;
        schedMetrics = results.metrics;
    }
    
    tickSchedulerSim();
});

function playSchedulerSim() {
    schedIsPlaying = true;
    document.getElementById('btn-sched-run').disabled = true;
    document.getElementById('btn-sched-pause').disabled = false;
    document.getElementById('btn-sched-step').disabled = true;
    
    const intervalMs = 1000 / schedSpeed;
    schedPlaybackInterval = setInterval(tickSchedulerSim, intervalMs);
}

function pauseSchedulerSim() {
    schedIsPlaying = false;
    clearInterval(schedPlaybackInterval);
    document.getElementById('btn-sched-run').disabled = false;
    document.getElementById('btn-sched-pause').disabled = true;
    document.getElementById('btn-sched-step').disabled = false;
}

// Single Scheduler Step tick
function tickSchedulerSim() {
    if (schedCurrentTime >= schedTimeline.length) {
        // Finished simulation!
        pauseSchedulerSim();
        document.getElementById('btn-sched-run').disabled = true;
        document.getElementById('btn-sched-step').disabled = true;
        
        // Render final stats
        displayAverageMetrics();
        return;
    }
    
    const currentTick = schedTimeline[schedCurrentTime];
    const activeProcId = currentTick.processId;
    
    // 1. Update CPU Core Visual
    const cpuNode = document.getElementById('cpu-active-proc');
    cpuNode.innerText = activeProcId;
    const cpuPanel = cpuNode.parentElement;
    
    if (activeProcId === 'IDLE') {
        cpuPanel.classList.remove('active');
        document.getElementById('cpu-progress').style.width = '0%';
        document.getElementById('cpu-time-left').innerText = '--';
    } else {
        cpuPanel.classList.add('active');
        
        // Calculate remaining time for active process at this instant
        const originalP = schedulerProcesses.find(p => p.id === activeProcId);
        
        // Count how many ticks this process runs in total, and how many are completed up to now
        let totalTicks = originalP.burstTime;
        let elapsedTicks = 0;
        for (let t = 0; t <= schedCurrentTime; t++) {
            if (schedTimeline[t].processId === activeProcId) {
                elapsedTicks++;
            }
        }
        
        // Find if this is completed in the timeline
        let remaining = totalTicks - elapsedTicks;
        document.getElementById('cpu-time-left').innerText = remaining + ' tick' + (remaining !== 1 ? 's' : '');
        
        let percent = (elapsedTicks / totalTicks) * 100;
        document.getElementById('cpu-progress').style.width = percent + '%';
        
        // Active table row highlight
        document.querySelectorAll('#scheduler-table-body tr').forEach(r => r.classList.remove('active-row'));
        const activeRow = document.getElementById(`row-${activeProcId}`);
        if (activeRow) activeRow.classList.add('active-row');
    }
    
    // 2. Update Ready Queue Visual
    updateReadyQueueVisual();

    // 3. Update Gantt Chart block
    appendGanttBlock(activeProcId, schedCurrentTime);

    // 4. Update completion tables dynamically
    updateLiveMetrics(activeProcId);
    
    schedCurrentTime++;
    updateGlobalTimer(schedCurrentTime);
}

function updateReadyQueueVisual() {
    const queueList = document.getElementById('ready-queue-list');
    queueList.innerHTML = '';
    
    // A process is "ready" if:
    // 1. It arrived at or before schedCurrentTime
    // 2. It has remaining burst time > 0
    // 3. It is NOT the process currently running in the CPU
    
    const activeProcId = schedTimeline[schedCurrentTime].processId;
    
    const readyProcesses = schedulerProcesses.filter(p => {
        // Must have arrived
        if (p.arrivalTime > schedCurrentTime) return false;
        
        // Must not be finished yet. We count how many times it has run up to the CURRENT step
        let runTicks = 0;
        for (let t = 0; t < schedCurrentTime; t++) {
            if (schedTimeline[t].processId === p.id) {
                runTicks++;
            }
        }
        const hasTimeLeft = runTicks < p.burstTime;
        
        // Must not be currently executing
        const isCurrentlyRunning = (p.id === activeProcId);
        
        return hasTimeLeft && !isCurrentlyRunning;
    });
    
    // Sort ready queue by arrival time (standard FIFO order for queue displays)
    readyProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);

    if (readyProcesses.length === 0) {
        queueList.innerHTML = '<div class="empty-queue-msg text-dim">Queue is empty</div>';
    } else {
        readyProcesses.forEach((p, idx) => {
            const card = document.createElement('div');
            // Style color based on ID index
            let colorIdx = getProcessColorIndex(p.id);
            card.className = `proc-card border-l-4 border-l-accent`;
            card.style.borderLeftColor = getProcessColorCode(p.id);
            card.innerHTML = `
                <div class="card-id">${p.id}</div>
                <div class="card-burst">Arr: ${p.arrivalTime}</div>
            `;
            queueList.appendChild(card);
        });
    }
}

function getProcessColorIndex(procId) {
    if (procId === 'IDLE') return -1;
    // Map P0->0, P1->1, etc., or dynamically hash
    const match = procId.match(/\d+/);
    if (match) return Number(match[0]) % 7;
    return procId.charCodeAt(0) % 7;
}

function getProcessColorCode(procId) {
    const colors = ['#38bdf8', '#34d399', '#a78bfa', '#fb7185', '#fb923c', '#facc15', '#2dd4bf'];
    const idx = getProcessColorIndex(procId);
    if (idx === -1) return '#475569';
    return colors[idx];
}

function appendGanttBlock(procId, timeVal) {
    const timeline = document.getElementById('gantt-timeline');
    const labels = document.getElementById('gantt-labels');
    
    // Check if we can merge with previous block
    const lastBlock = timeline.lastElementChild;
    const blockWidth = 32; // width per tick in pixels
    
    if (lastBlock && lastBlock.getAttribute('data-proc') === procId) {
        // Extend last block width
        let currentWidth = parseFloat(lastBlock.style.width);
        lastBlock.style.width = (currentWidth + blockWidth) + 'px';
        
        // Update label position of last time stamp (if step label)
        const lastLabel = labels.lastElementChild;
        if (lastLabel) {
            lastLabel.style.left = (parseFloat(lastLabel.style.left) + blockWidth) + 'px';
            lastLabel.innerText = timeVal + 1;
        }
    } else {
        // Create new block
        const block = document.createElement('div');
        block.setAttribute('data-proc', procId);
        block.style.width = blockWidth + 'px';
        
        let colorClass = 'idle';
        if (procId !== 'IDLE') {
            const cIdx = getProcessColorIndex(procId);
            colorClass = `bg-p${cIdx}`;
        }
        block.className = `gantt-block ${colorClass}`;
        block.innerText = procId;
        timeline.appendChild(block);
        
        // Add time ticks
        // If it is the first block, add 0 label
        if (timeline.children.length === 1) {
            const startLabel = document.createElement('span');
            startLabel.className = 'gantt-time';
            startLabel.style.left = '0px';
            startLabel.innerText = '0';
            labels.appendChild(startLabel);
        }
        
        const endLabel = document.createElement('span');
        endLabel.className = 'gantt-time';
        
        // Position of label is sum of all block widths
        let totalWidth = 0;
        Array.from(timeline.children).forEach(child => {
            totalWidth += parseFloat(child.style.width);
        });
        
        endLabel.style.left = totalWidth + 'px';
        endLabel.innerText = timeVal + 1;
        labels.appendChild(endLabel);
    }
    
    // Auto scroll Gantt Container
    const ganttContainer = timeline.parentElement;
    ganttContainer.scrollLeft = ganttContainer.scrollWidth;
}

function updateLiveMetrics(activeProcId) {
    if (activeProcId === 'IDLE') return;
    
    // A process completion occurs if this is the final tick of its execution
    const originalP = schedulerProcesses.find(p => p.id === activeProcId);
    let runTicks = 0;
    for (let t = 0; t <= schedCurrentTime; t++) {
        if (schedTimeline[t].processId === activeProcId) {
            runTicks++;
        }
    }
    
    // If it has run all its burst ticks, update cells
    if (runTicks === originalP.burstTime) {
        const m = schedMetrics[activeProcId];
        if (m) {
            const ctCell = document.getElementById(`ct-${activeProcId}`);
            const tatCell = document.getElementById(`tat-${activeProcId}`);
            const wtCell = document.getElementById(`wt-${activeProcId}`);
            const rtCell = document.getElementById(`rt-${activeProcId}`);
            
            if (ctCell) ctCell.innerText = m.ct;
            if (tatCell) tatCell.innerText = m.tat;
            if (wtCell) wtCell.innerText = m.wt;
            if (rtCell) rtCell.innerText = m.rt;
        }
    }
}

function displayAverageMetrics() {
    let totalTat = 0;
    let totalWt = 0;
    const n = schedulerProcesses.length;
    
    schedulerProcesses.forEach(p => {
        const m = schedMetrics[p.id];
        if (m) {
            totalTat += m.tat;
            totalWt += m.wt;
        }
    });
    
    document.getElementById('avg-tat').innerText = (totalTat / n).toFixed(2);
    document.getElementById('avg-wt').innerText = (totalWt / n).toFixed(2);
}

// ==========================================
// C. Memory Manager Module (Dynamic Allocation)
// ==========================================

// Load demo partitioning
document.getElementById('btn-load-memory-demo').addEventListener('click', () => {
    memoryBlocks = [
        { id: 'B1', start: 0, size: 100, allocatedProcessId: null, internalFragmentation: 0 },
        { id: 'B2', start: 100, size: 50, allocatedProcessId: null, internalFragmentation: 0 },
        { id: 'B3', start: 150, size: 200, allocatedProcessId: null, internalFragmentation: 0 },
        { id: 'B4', start: 350, size: 80, allocatedProcessId: null, internalFragmentation: 0 },
        { id: 'B5', start: 430, size: 120, allocatedProcessId: null, internalFragmentation: 0 }
    ];
    renderMemoryBlocks();
    updateMemoryStats();
    populateActiveProcessList();
    
    const consoleNode = document.getElementById('mem-scan-console');
    consoleNode.innerHTML = `<span class="text-dim">Loaded demo partition grid: 100 KB, 50 KB, 200 KB, 80 KB, 120 KB</span>`;
});

function renderMemoryBlocks() {
    const mapBar = document.getElementById('memory-map-bar-visual');
    mapBar.innerHTML = '';
    
    memoryBlocks.forEach((b, index) => {
        const div = document.createElement('div');
        div.id = `mem-block-${index}`;
        div.className = `memory-block ${b.allocatedProcessId ? 'allocated' : 'free'}`;
        
        // Calculate dynamic width percent
        const widthPercent = (b.size / memoryCapacity) * 100;
        div.style.width = widthPercent + '%';
        
        let labelText = b.allocatedProcessId ? b.allocatedProcessId : 'Free';
        
        div.innerHTML = `
            <span class="block-label">${labelText}</span>
            <span class="block-size">${b.size} KB</span>
        `;
        mapBar.appendChild(div);
    });
    
    renderMemoryTable();
}

function renderMemoryTable() {
    const tbody = document.getElementById('mem-partitions-table-body');
    tbody.innerHTML = '';
    
    memoryBlocks.forEach(b => {
        const tr = document.createElement('tr');
        const end = b.start + b.size;
        const status = b.allocatedProcessId ? `<span class="text-green font-semibold">Allocated</span>` : `<span class="text-dim">Free</span>`;
        const proc = b.allocatedProcessId || '--';
        const frag = b.internalFragmentation ? b.internalFragmentation + ' KB' : '0 KB';
        
        tr.innerHTML = `
            <td class="mono">${b.start} - ${end} KB</td>
            <td class="mono">${b.size} KB</td>
            <td>${status}</td>
            <td class="mono">${proc}</td>
            <td class="mono">${frag}</td>
        `;
        tbody.appendChild(tr);
    });
}

function updateMemoryStats() {
    let allocated = 0;
    let frag = 0;
    
    memoryBlocks.forEach(b => {
        if (b.allocatedProcessId) {
            allocated += b.size;
            frag += b.internalFragmentation;
        }
    });
    
    document.getElementById('mem-total-display').innerText = memoryCapacity + ' KB';
    document.getElementById('mem-allocated-display').innerText = allocated + ' KB';
    document.getElementById('mem-frag-display').innerText = frag + ' KB';
}

function populateActiveProcessList() {
    const select = document.getElementById('mem-free-proc-select');
    select.innerHTML = '<option value="" disabled selected>Select an active process</option>';
    
    const activeProcs = [];
    memoryBlocks.forEach(b => {
        if (b.allocatedProcessId && !activeProcs.includes(b.allocatedProcessId)) {
            activeProcs.push(b.allocatedProcessId);
        }
    });
    
    if (activeProcs.length === 0) {
        select.innerHTML = '<option value="" disabled selected>No active processes</option>';
    } else {
        activeProcs.forEach(pId => {
            const opt = document.createElement('option');
            opt.value = pId;
            opt.innerText = pId;
            select.appendChild(opt);
        });
    }
}

// Reset Memory State
document.getElementById('btn-mem-reset').addEventListener('click', () => {
    // Reset back to completely free block of capacity
    memoryBlocks = [
        { id: 'B1', start: 0, size: memoryCapacity, allocatedProcessId: null, internalFragmentation: 0 }
    ];
    renderMemoryBlocks();
    updateMemoryStats();
    populateActiveProcessList();
    
    const consoleNode = document.getElementById('mem-scan-console');
    consoleNode.innerHTML = `<span class="text-dim">Memory reset to default capacity of ${memoryCapacity} KB.</span>`;
});

// Form: Allocate Memory (Run Immediate)
document.getElementById('mem-allocate-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const procId = document.getElementById('mem-req-proc-id').value.trim().toUpperCase();
    const size = Number(document.getElementById('mem-req-size').value);
    
    if (!procId) return;
    
    // Check if process is already allocated
    if (memoryBlocks.some(b => b.allocatedProcessId === procId)) {
        alert('Process ID is already active in memory!');
        return;
    }
    
    const alg = document.getElementById('mem-algorithm').value;
    const res = allocateMemory(alg, memoryBlocks, { id: procId, size });
    
    if (res.allocatedIdx === -1) {
        alert(`Memory Allocation Failed: No suitable block found for ${size} KB using ${alg.replace('_', ' ')}.`);
        return;
    }
    
    memoryBlocks = res.blocks;
    renderMemoryBlocks();
    updateMemoryStats();
    populateActiveProcessList();
    
    // Console log
    const consoleNode = document.getElementById('mem-scan-console');
    consoleNode.innerHTML = `<span class="text-green font-semibold">[SUCCESS]</span> Process ${procId} allocated ${size} KB in partition index ${res.allocatedIdx}.`;
    
    // Clear inputs
    document.getElementById('mem-req-proc-id').value = '';
});

// Visual Step-by-Step Allocation Simulation
document.getElementById('btn-mem-allocate-step').addEventListener('click', () => {
    const procId = document.getElementById('mem-req-proc-id').value.trim().toUpperCase();
    const sizeInput = document.getElementById('mem-req-size').value;
    
    if (!procId || !sizeInput) {
        alert('Please fill out the Process ID and Size fields first.');
        return;
    }
    
    const size = Number(sizeInput);
    if (memoryBlocks.some(b => b.allocatedProcessId === procId)) {
        alert('Process ID is already active in memory!');
        return;
    }
    
    const alg = document.getElementById('mem-algorithm').value;
    const res = allocateMemory(alg, memoryBlocks, { id: procId, size });
    const steps = res.steps;
    
    if (steps.length === 0) {
        alert('No memory blocks to scan.');
        return;
    }
    
    // Disable inputs & buttons
    disableMemoryControls(true);
    
    let stepIndex = 0;
    const consoleNode = document.getElementById('mem-scan-console');
    consoleNode.innerHTML = `<span class="text-yellow">Starting scanning check for ${size} KB...</span>`;
    
    function scanNext() {
        if (stepIndex >= steps.length) {
            // Done scanning! Allocate now if successful
            disableMemoryControls(false);
            
            if (res.allocatedIdx !== -1) {
                // Flash success green on selected block
                const selDiv = document.getElementById(`mem-block-${res.allocatedIdx}`);
                if (selDiv) {
                    selDiv.classList.add('hit-success');
                    setTimeout(() => {
                        memoryBlocks = res.blocks;
                        renderMemoryBlocks();
                        updateMemoryStats();
                        populateActiveProcessList();
                        consoleNode.innerHTML = `<span class="text-green font-semibold">[ALLOCATED]</span> Selected partition block index ${res.allocatedIdx} for Process ${procId}.`;
                    }, 800);
                }
            } else {
                consoleNode.innerHTML = `<span class="text-red font-semibold">[FAILED]</span> Out of Memory (OOM) - No block fits request of ${size} KB.`;
                alert('Allocation Failed: Insufficient contiguous space available.');
                // Re-render blocks to clear scan highlights
                renderMemoryBlocks();
            }
            return;
        }
        
        // Highlight active block being scanned
        const step = steps[stepIndex];
        const blockDiv = document.getElementById(`mem-block-${step.index}`);
        
        // Remove scanning class from others
        document.querySelectorAll('.memory-map-bar .memory-block').forEach(div => {
            div.classList.remove('scanning');
        });
        
        if (blockDiv) {
            blockDiv.classList.add('scanning');
            
            // Console log description
            let block = memoryBlocks[step.index];
            if (step.status === 'checking') {
                consoleNode.innerHTML = `Checking Block ${step.index} (${block.size} KB)...`;
            } else if (step.status === 'busy') {
                consoleNode.innerHTML = `Block ${step.index} is busy (Allocated to ${block.allocatedProcessId}). Skipping.`;
                blockDiv.classList.add('hit-failed');
            } else if (step.status === 'too_small') {
                consoleNode.innerHTML = `Block ${step.index} is too small (${block.size} KB < ${size} KB). Skipping.`;
                blockDiv.classList.add('hit-failed');
            } else if (step.status === 'potential' || step.status === 'selected') {
                consoleNode.innerHTML = `Block ${step.index} fits! Size: ${block.size} KB. (Remaining gap: ${block.size - size} KB)`;
                blockDiv.classList.add('hit-success');
            }
        }
        
        stepIndex++;
        // Repeat scanning at delay
        setTimeout(scanNext, 800);
    }
    
    // Start scan loop
    scanNext();
});

function disableMemoryControls(disable) {
    document.getElementById('btn-mem-allocate-step').disabled = disable;
    document.getElementById('btn-mem-reset').disabled = disable;
    document.querySelector('#mem-allocate-form button').disabled = disable;
    document.querySelector('#mem-free-form button').disabled = disable;
}

// Form: Free memory
document.getElementById('mem-free-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const select = document.getElementById('mem-free-proc-select');
    const procId = select.value;
    
    if (!procId) return;
    
    // Release blocks
    memoryBlocks.forEach(b => {
        if (b.allocatedProcessId === procId) {
            b.allocatedProcessId = null;
            b.internalFragmentation = 0;
        }
    });
    
    // Coalesce contiguous free blocks
    memoryBlocks = coalesceMemory(memoryBlocks);
    
    renderMemoryBlocks();
    updateMemoryStats();
    populateActiveProcessList();
    
    // Console log
    const consoleNode = document.getElementById('mem-scan-console');
    consoleNode.innerHTML = `<span class="text-green">[RELEASED]</span> Process ${procId} memory space freed. Free blocks merged successfully.`;
});

// ==========================================
// D. Memory Manager Module (Page Replacement)
// ==========================================

// Load demo paging stream
document.getElementById('btn-load-paging-demo').addEventListener('click', () => {
    document.getElementById('paging-stream-input').value = '7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2';
    document.getElementById('paging-frame-count').value = '3';
});

document.getElementById('btn-paging-simulate').addEventListener('click', () => {
    const alg = document.getElementById('paging-algorithm').value;
    const capacity = Number(document.getElementById('paging-frame-count').value);
    const rawStream = document.getElementById('paging-stream-input').value;
    
    // Clean stream
    const pageStream = rawStream.split(',')
                                .map(val => val.trim())
                                .filter(val => val !== '')
                                .map(val => Number(val));
                                
    if (pageStream.length === 0) {
        alert('Please enter a valid page request stream (e.g. 1, 2, 3, ...).');
        return;
    }
    
    if (capacity < 1 || capacity > 6) {
        alert('Frame size must be between 1 and 6.');
        return;
    }
    
    const steps = runPageReplacement(alg, pageStream, capacity);
    renderPagingGrid(pageStream, steps, capacity);
});

function renderPagingGrid(pages, steps, capacity) {
    const table = document.getElementById('paging-grid-table');
    table.innerHTML = '';
    
    // 1. Create Request Header Row
    const headerRow = document.createElement('tr');
    headerRow.className = 'req-header-row';
    headerRow.innerHTML = '<th>Reference</th>';
    pages.forEach(p => {
        headerRow.innerHTML += `<th>${p}</th>`;
    });
    table.appendChild(headerRow);
    
    // 2. Create Frame Rows
    for (let f = 0; f < capacity; f++) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="mono font-semibold">Slot ${f+1}</td>`;
        
        for (let s = 0; s < steps.length; s++) {
            const step = steps[s];
            const val = step.frames[f] !== undefined ? step.frames[f] : '';
            
            // Check if page was newly loaded/replaced in this frame slot
            // If it's a fault and this cell value is the target page
            let cellClass = '';
            if (!step.isHit && val === step.page) {
                cellClass = 'cell-fault'; // Reddish tint
            } else if (step.isHit && val === step.page) {
                cellClass = 'cell-hit'; // Greenish tint
            }
            
            tr.innerHTML += `<td class="mono ${cellClass}">${val}</td>`;
        }
        table.appendChild(tr);
    }
    
    // 3. Create Status Footer Row
    const statusRow = document.createElement('tr');
    statusRow.className = 'status-row';
    statusRow.innerHTML = `<td class="font-semibold text-dim">Result</td>`;
    
    let faultsCount = 0;
    let hitsCount = 0;
    
    steps.forEach(step => {
        if (step.isHit) {
            statusRow.innerHTML += `<td class="text-green"><i class="fa-solid fa-circle-check"></i> HIT</td>`;
            hitsCount++;
        } else {
            statusRow.innerHTML += `<td class="text-red"><i class="fa-solid fa-triangle-exclamation"></i> MISS</td>`;
            faultsCount++;
        }
    });
    table.appendChild(statusRow);
    
    // Update Stats Display
    document.getElementById('paging-hits').innerText = hitsCount;
    document.getElementById('paging-faults').innerText = faultsCount;
    
    const ratio = (hitsCount / pages.length) * 100;
    document.getElementById('paging-ratio').innerText = ratio.toFixed(1) + '%';
}

// ==========================================
// E. Deadlock Avoidance (Banker's Algorithm)
// ==========================================

// Load demo safety scenarios
document.getElementById('btn-load-bankers-demo').addEventListener('click', () => {
    bankersAllocation = [
        [0, 1, 0],
        [2, 0, 0],
        [3, 0, 2],
        [2, 1, 1],
        [0, 0, 2]
    ];
    bankersMax = [
        [7, 5, 3],
        [3, 2, 2],
        [9, 0, 2],
        [2, 2, 2],
        [4, 3, 3]
    ];
    bankersAvailable = [3, 3, 2];
    
    renderBankersInputs();
    resetBankersResults();
});

document.getElementById('btn-load-bankers-unsafe-demo').addEventListener('click', () => {
    // Allocation forces unsafe state (P0 holds 1, but requests 7...)
    bankersAllocation = [
        [2, 1, 0],
        [3, 0, 2],
        [3, 0, 2],
        [2, 1, 1],
        [0, 0, 2]
    ];
    bankersMax = [
        [7, 5, 3],
        [4, 2, 2],
        [9, 0, 2],
        [2, 2, 2],
        [4, 3, 3]
    ];
    bankersAvailable = [1, 0, 1]; // Low availability to trigger deadlock
    
    renderBankersInputs();
    resetBankersResults();
});

function renderBankersInputs() {
    // Load available vector inputs
    document.getElementById('avail-res-a').value = bankersAvailable[0];
    document.getElementById('avail-res-b').value = bankersAvailable[1];
    document.getElementById('avail-res-c').value = bankersAvailable[2];
    
    const tbody = document.getElementById('bankers-inputs-body');
    tbody.innerHTML = '';
    
    bankersProcesses.forEach((p, pIdx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-semibold text-dim">${p}</td>
            <!-- Allocation -->
            <td><input type="number" id="alloc-${pIdx}-0" value="${bankersAllocation[pIdx][0]}" min="0"></td>
            <td><input type="number" id="alloc-${pIdx}-1" value="${bankersAllocation[pIdx][1]}" min="0"></td>
            <td><input type="number" id="alloc-${pIdx}-2" value="${bankersAllocation[pIdx][2]}" min="0"></td>
            <!-- Max -->
            <td><input type="number" id="max-${pIdx}-0" value="${bankersMax[pIdx][0]}" min="0"></td>
            <td><input type="number" id="max-${pIdx}-1" value="${bankersMax[pIdx][1]}" min="0"></td>
            <td><input type="number" id="max-${pIdx}-2" value="${bankersMax[pIdx][2]}" min="0"></td>
        `;
        tbody.appendChild(tr);
    });
}

function resetBankersResults() {
    const card = document.getElementById('bankers-status-card');
    card.className = 'card glass-panel safety-alert-card text-center';
    
    document.getElementById('bankers-safe-status').innerText = 'READY TO EVALUATE';
    document.getElementById('bankers-sequence-display').innerText = 'Click Run to evaluate system safety.';
    
    document.getElementById('bankers-calc-body').innerHTML = `
        <tr>
            <td colspan="10" class="text-center text-dim py-8">No calculation performed. Click verify safety.</td>
        </tr>
    `;
    document.getElementById('bankers-steps-log').innerHTML = `
        <div class="step-log-item info"><i class="fa-solid fa-info-circle"></i> Waiting for verification run...</div>
    `;
}

// Read inputs and run Banker's safety check
document.getElementById('btn-bankers-verify').addEventListener('click', () => {
    // 1. Gather Available values
    const avail = [
        Number(document.getElementById('avail-res-a').value),
        Number(document.getElementById('avail-res-b').value),
        Number(document.getElementById('avail-res-c').value)
    ];
    bankersAvailable = avail;
    
    // 2. Gather Matrix values
    const alloc = [];
    const max = [];
    
    for (let i = 0; i < bankersProcesses.length; i++) {
        alloc[i] = [
            Number(document.getElementById(`alloc-${i}-0`).value),
            Number(document.getElementById(`alloc-${i}-1`).value),
            Number(document.getElementById(`alloc-${i}-2`).value)
        ];
        max[i] = [
            Number(document.getElementById(`max-${i}-0`).value),
            Number(document.getElementById(`max-${i}-1`).value),
            Number(document.getElementById(`max-${i}-2`).value)
        ];
    }
    bankersAllocation = alloc;
    bankersMax = max;
    
    // Run safety calculations
    const res = runBankersAlgorithm(
        bankersProcesses,
        bankersResources,
        bankersTotal,
        bankersAllocation,
        bankersMax,
        bankersAvailable
    );
    
    // Render calculations table
    renderBankersCalcTable(res.needMatrix);
    
    // Render status details
    animateBankersSteps(res);
});

function renderBankersCalcTable(needMatrix) {
    const tbody = document.getElementById('bankers-calc-body');
    tbody.innerHTML = '';
    
    bankersProcesses.forEach((p, idx) => {
        const tr = document.createElement('tr');
        tr.id = `bank-row-${idx}`;
        tr.innerHTML = `
            <td class="font-semibold text-dim">${p}</td>
            <td class="mono">${bankersMax[idx][0]}</td>
            <td class="mono">${bankersMax[idx][1]}</td>
            <td class="mono">${bankersMax[idx][2]}</td>
            <td class="mono">${bankersAllocation[idx][0]}</td>
            <td class="mono">${bankersAllocation[idx][1]}</td>
            <td class="mono">${bankersAllocation[idx][2]}</td>
            <td class="mono cell-highlight">${needMatrix[idx][0]}</td>
            <td class="mono cell-highlight">${needMatrix[idx][1]}</td>
            <td class="mono cell-highlight">${needMatrix[idx][2]}</td>
        `;
        tbody.appendChild(tr);
    });
}

function animateBankersSteps(res) {
    const log = document.getElementById('bankers-steps-log');
    log.innerHTML = '';
    
    const card = document.getElementById('bankers-status-card');
    card.className = 'card glass-panel safety-alert-card text-center';
    
    document.getElementById('bankers-safe-status').innerText = 'EVALUATING SYSTEM STATE...';
    document.getElementById('bankers-sequence-display').innerText = 'Running safety heuristic check...';
    
    let stepIndex = 0;
    const steps = res.steps;
    
    function showNextStep() {
        if (stepIndex >= steps.length) {
            // End of steps! Show final alert
            if (res.isSafe) {
                card.classList.add('safe');
                document.getElementById('bankers-safe-status').innerText = 'SAFE STATE IDENTIFIED';
                
                const seqStr = res.sequence.join(' → ');
                document.getElementById('bankers-sequence-display').innerHTML = `Safe Sequence: <span class="mono text-green font-semibold">&lt; ${seqStr} &gt;</span>`;
                
                log.innerHTML += `
                    <div class="step-log-item success">
                        <i class="fa-solid fa-circle-check"></i>
                        <span>System state verified. All processes allocated successfully in safe cycle.</span>
                    </div>
                `;
            } else {
                card.classList.add('unsafe');
                document.getElementById('bankers-safe-status').innerText = 'UNSAFE / DEADLOCK STATE DETECTED';
                document.getElementById('bankers-sequence-display').innerText = 'Deadlock Alert: No safe execution sequence exists for remaining demands.';
                
                log.innerHTML += `
                    <div class="step-log-item failed">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <span>Deadlock verification failed. Unallocated processes will block indefinitely.</span>
                    </div>
                `;
            }
            
            // Auto scroll console
            log.scrollTop = log.scrollHeight;
            return;
        }
        
        const step = steps[stepIndex];
        const item = document.createElement('div');
        
        // Highlight active matrix row during calculation
        document.querySelectorAll('#bankers-calc-body tr').forEach(r => r.classList.remove('active-row'));
        const row = document.getElementById(`bank-row-${step.processIndex}`);
        if (row) row.classList.add('active-row');
        
        if (step.canAllocate) {
            item.className = 'step-log-item success';
            item.innerHTML = `
                <i class="fa-solid fa-check-circle"></i>
                <span>
                    ${step.process}: Need [${step.need.join(', ')}] ≤ Available [${step.workBefore.join(', ')}]. 
                    Process runs and releases resources. Available vector updated: [${step.workAfter.join(', ')}].
                </span>
            `;
        } else {
            item.className = 'step-log-item failed';
            item.innerHTML = `
                <i class="fa-solid fa-times-circle"></i>
                <span>
                    ${step.process}: Need [${step.need.join(', ')}] &gt; Available [${step.workBefore.join(', ')}]. 
                    Process is blocked (Must wait).
                </span>
            `;
        }
        
        log.appendChild(item);
        log.scrollTop = log.scrollHeight;
        
        stepIndex++;
        // Print next log line at speed
        setTimeout(showNextStep, 1000);
    }
    
    // Start printing log rows
    showNextStep();
}

// Initial Render on Load
window.addEventListener('DOMContentLoaded', () => {
    switchTab('overview');
});
