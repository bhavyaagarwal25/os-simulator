/**
 * OS Simulator Algorithms Library
 * JS implementation of key Operating System algorithms.
 */

// ==========================================
// 1. Process Scheduling Algorithms
// ==========================================

/**
 * Calculates metrics and run history for CPU Scheduling
 * @param {string} algorithm - 'fcfs', 'sjf_np', 'sjf_p', 'priority_np', 'priority_p', 'rr'
 * @param {Array} processes - Array of { id, arrivalTime, burstTime, priority }
 * @param {number} quantum - Time quantum (for Round Robin)
 * @returns {Object} { timeline: [{time, processId}], metrics: {id: {ct, tat, wt, rt}} }
 */
function runScheduler(algorithm, processes, quantum = 2) {
    // Clone processes to avoid modifying original array
    const procs = processes.map(p => ({
        id: p.id,
        arrivalTime: Number(p.arrivalTime),
        burstTime: Number(p.burstTime),
        priority: Number(p.priority),
        remainingTime: Number(p.burstTime),
        startTime: -1,
        completionTime: 0,
        tempIndex: 0
    }));

    const timeline = [];
    const metrics = {};
    procs.forEach(p => {
        metrics[p.id] = { id: p.id, ct: 0, tat: 0, wt: 0, rt: 0, st: -1 };
    });

    let currentTime = 0;
    let completedCount = 0;
    const n = procs.length;

    if (n === 0) return { timeline, metrics };

    if (algorithm === 'fcfs') {
        // Sort by arrival time. If equal, by ID.
        const queue = [...procs].sort((a, b) => {
            if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
            return a.id.localeCompare(b.id);
        });

        while (completedCount < n) {
            // Find if any process is available
            const ready = queue.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);
            if (ready.length === 0) {
                // CPU idle
                timeline.push({ time: currentTime, processId: 'IDLE' });
                currentTime++;
                continue;
            }

            const p = ready[0];
            if (p.startTime === -1) {
                p.startTime = currentTime;
                metrics[p.id].rt = currentTime - p.arrivalTime;
            }

            // Run to completion
            const runLength = p.remainingTime;
            for (let i = 0; i < runLength; i++) {
                timeline.push({ time: currentTime, processId: p.id });
                currentTime++;
            }
            p.remainingTime = 0;
            p.completionTime = currentTime;
            metrics[p.id].ct = p.completionTime;
            metrics[p.id].tat = p.completionTime - p.arrivalTime;
            metrics[p.id].wt = metrics[p.id].tat - p.burstTime;
            completedCount++;
        }
    } 
    else if (algorithm === 'sjf_np') {
        // Shortest Job First - Non-preemptive
        const completed = new Set();
        while (completedCount < n) {
            const available = procs.filter(p => p.arrivalTime <= currentTime && !completed.has(p.id));
            if (available.length === 0) {
                timeline.push({ time: currentTime, processId: 'IDLE' });
                currentTime++;
                continue;
            }

            // Select job with minimum burst time. If equal, by arrival time.
            available.sort((a, b) => {
                if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
                return a.arrivalTime - b.arrivalTime;
            });

            const p = available[0];
            p.startTime = currentTime;
            metrics[p.id].rt = currentTime - p.arrivalTime;

            // Execute to completion
            const run = p.burstTime;
            for (let i = 0; i < run; i++) {
                timeline.push({ time: currentTime, processId: p.id });
                currentTime++;
            }
            p.completionTime = currentTime;
            metrics[p.id].ct = p.completionTime;
            metrics[p.id].tat = p.completionTime - p.arrivalTime;
            metrics[p.id].wt = metrics[p.id].tat - p.burstTime;
            completed.add(p.id);
            completedCount++;
        }
    } 
    else if (algorithm === 'sjf_p') {
        // Shortest Job First - Preemptive (Shortest Remaining Time First)
        while (completedCount < n) {
            const available = procs.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);
            if (available.length === 0) {
                timeline.push({ time: currentTime, processId: 'IDLE' });
                currentTime++;
                continue;
            }

            // Select with minimum remaining time. If equal, by arrival time.
            available.sort((a, b) => {
                if (a.remainingTime !== b.remainingTime) return a.remainingTime - b.remainingTime;
                return a.arrivalTime - b.arrivalTime;
            });

            const p = available[0];
            if (p.startTime === -1) {
                p.startTime = currentTime;
                metrics[p.id].rt = currentTime - p.arrivalTime;
            }

            timeline.push({ time: currentTime, processId: p.id });
            p.remainingTime--;
            currentTime++;

            if (p.remainingTime === 0) {
                p.completionTime = currentTime;
                metrics[p.id].ct = p.completionTime;
                metrics[p.id].tat = p.completionTime - p.arrivalTime;
                metrics[p.id].wt = metrics[p.id].tat - p.burstTime;
                completedCount++;
            }
        }
    } 
    else if (algorithm === 'priority_np') {
        // Priority - Non-preemptive (Lower number = Higher priority)
        const completed = new Set();
        while (completedCount < n) {
            const available = procs.filter(p => p.arrivalTime <= currentTime && !completed.has(p.id));
            if (available.length === 0) {
                timeline.push({ time: currentTime, processId: 'IDLE' });
                currentTime++;
                continue;
            }

            // Select with highest priority (lowest number). If equal, by arrival time.
            available.sort((a, b) => {
                if (a.priority !== b.priority) return a.priority - b.priority;
                return a.arrivalTime - b.arrivalTime;
            });

            const p = available[0];
            p.startTime = currentTime;
            metrics[p.id].rt = currentTime - p.arrivalTime;

            // Execute to completion
            const run = p.burstTime;
            for (let i = 0; i < run; i++) {
                timeline.push({ time: currentTime, processId: p.id });
                currentTime++;
            }
            p.completionTime = currentTime;
            metrics[p.id].ct = p.completionTime;
            metrics[p.id].tat = p.completionTime - p.arrivalTime;
            metrics[p.id].wt = metrics[p.id].tat - p.burstTime;
            completed.add(p.id);
            completedCount++;
        }
    } 
    else if (algorithm === 'priority_p') {
        // Priority - Preemptive
        while (completedCount < n) {
            const available = procs.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);
            if (available.length === 0) {
                timeline.push({ time: currentTime, processId: 'IDLE' });
                currentTime++;
                continue;
            }

            // Select with highest priority (lowest number). If equal, by arrival time.
            available.sort((a, b) => {
                if (a.priority !== b.priority) return a.priority - b.priority;
                return a.arrivalTime - b.arrivalTime;
            });

            const p = available[0];
            if (p.startTime === -1) {
                p.startTime = currentTime;
                metrics[p.id].rt = currentTime - p.arrivalTime;
            }

            timeline.push({ time: currentTime, processId: p.id });
            p.remainingTime--;
            currentTime++;

            if (p.remainingTime === 0) {
                p.completionTime = currentTime;
                metrics[p.id].ct = p.completionTime;
                metrics[p.id].tat = p.completionTime - p.arrivalTime;
                metrics[p.id].wt = metrics[p.id].tat - p.burstTime;
                completedCount++;
            }
        }
    } 
    else if (algorithm === 'rr') {
        // Round Robin
        // Queue stores indices/objects.
        const readyQueue = [];
        const inQueue = new Set();
        
        // Sort processes initially by arrival time to help enqueueing
        const sortedProcs = [...procs].sort((a, b) => a.arrivalTime - b.arrivalTime);
        
        let checkedIndex = 0;
        
        // Push initial processes that arrived at 0
        while (checkedIndex < n && sortedProcs[checkedIndex].arrivalTime <= currentTime) {
            readyQueue.push(sortedProcs[checkedIndex]);
            inQueue.add(sortedProcs[checkedIndex].id);
            checkedIndex++;
        }

        while (completedCount < n) {
            if (readyQueue.length === 0) {
                // If queue is empty, is there any process coming in the future?
                if (checkedIndex < n) {
                    // Fast forward time or just record idle ticks until next arrival
                    timeline.push({ time: currentTime, processId: 'IDLE' });
                    currentTime++;
                    // Check arrivals again
                    while (checkedIndex < n && sortedProcs[checkedIndex].arrivalTime <= currentTime) {
                        readyQueue.push(sortedProcs[checkedIndex]);
                        inQueue.add(sortedProcs[checkedIndex].id);
                        checkedIndex++;
                    }
                } else {
                    // No processes, but we haven't completed? (Shouldn't happen)
                    break;
                }
                continue;
            }

            const p = readyQueue.shift();
            inQueue.delete(p.id);

            if (p.startTime === -1) {
                p.startTime = currentTime;
                metrics[p.id].rt = currentTime - p.arrivalTime;
            }

            const runTime = Math.min(p.remainingTime, quantum);
            for (let i = 0; i < runTime; i++) {
                timeline.push({ time: currentTime, processId: p.id });
                currentTime++;
                
                // During run, other processes might arrive. Enqueue them immediately!
                while (checkedIndex < n && sortedProcs[checkedIndex].arrivalTime <= currentTime) {
                    if (!inQueue.has(sortedProcs[checkedIndex].id)) {
                        readyQueue.push(sortedProcs[checkedIndex]);
                        inQueue.add(sortedProcs[checkedIndex].id);
                    }
                    checkedIndex++;
                }
            }

            p.remainingTime -= runTime;

            if (p.remainingTime > 0) {
                // Add back to queue
                readyQueue.push(p);
                inQueue.add(p.id);
            } else {
                p.completionTime = currentTime;
                metrics[p.id].ct = p.completionTime;
                metrics[p.id].tat = p.completionTime - p.arrivalTime;
                metrics[p.id].wt = metrics[p.id].tat - p.burstTime;
                completedCount++;
            }
            
            // Just in case, check for new arrivals at this exact timestamp (if not done already)
            while (checkedIndex < n && sortedProcs[checkedIndex].arrivalTime <= currentTime) {
                if (!inQueue.has(sortedProcs[checkedIndex].id)) {
                    readyQueue.push(sortedProcs[checkedIndex]);
                    inQueue.add(sortedProcs[checkedIndex].id);
                }
                checkedIndex++;
            }
        }
    }

    return { timeline, metrics };
}

// ==========================================
// 2. Memory Allocation Algorithms
// ==========================================

/**
 * Simulates allocation of a process into dynamic memory blocks.
 * @param {string} algorithm - 'first_fit', 'best_fit', 'worst_fit'
 * @param {Array} blocks - Array of { id, start, size, allocatedProcessId, internalFragmentation }
 * @param {Object} processRequest - { id, size }
 * @returns {Object} { blocks: updatedBlocks, allocatedIdx: number, steps: Array }
 */
function allocateMemory(algorithm, blocks, processRequest) {
    const reqSize = Number(processRequest.size);
    const procId = processRequest.id;
    
    // Copy blocks
    const nextBlocks = blocks.map(b => ({ ...b }));
    const steps = []; // Track blocks scanned for visualization
    let allocatedIdx = -1;

    if (algorithm === 'first_fit') {
        for (let i = 0; i < nextBlocks.length; i++) {
            steps.push({ index: i, checked: true, status: 'checking' });
            if (nextBlocks[i].allocatedProcessId === null && nextBlocks[i].size >= reqSize) {
                allocatedIdx = i;
                steps[steps.length - 1].status = 'selected';
                break;
            } else {
                steps[steps.length - 1].status = nextBlocks[i].allocatedProcessId !== null ? 'busy' : 'too_small';
            }
        }
    } 
    else if (algorithm === 'best_fit') {
        let bestIdx = -1;
        let minRemSize = Infinity;
        
        for (let i = 0; i < nextBlocks.length; i++) {
            steps.push({ index: i, checked: true, status: 'checking' });
            if (nextBlocks[i].allocatedProcessId === null && nextBlocks[i].size >= reqSize) {
                const rem = nextBlocks[i].size - reqSize;
                if (rem < minRemSize) {
                    minRemSize = rem;
                    bestIdx = i;
                }
                steps[steps.length - 1].status = 'potential';
            } else {
                steps[steps.length - 1].status = nextBlocks[i].allocatedProcessId !== null ? 'busy' : 'too_small';
            }
        }
        
        if (bestIdx !== -1) {
            allocatedIdx = bestIdx;
            // Mark the selected one in steps
            const selectStep = steps.find(s => s.index === bestIdx);
            if (selectStep) selectStep.status = 'selected';
        }
    } 
    else if (algorithm === 'worst_fit') {
        let worstIdx = -1;
        let maxRemSize = -1;
        
        for (let i = 0; i < nextBlocks.length; i++) {
            steps.push({ index: i, checked: true, status: 'checking' });
            if (nextBlocks[i].allocatedProcessId === null && nextBlocks[i].size >= reqSize) {
                const rem = nextBlocks[i].size - reqSize;
                if (rem > maxRemSize) {
                    maxRemSize = rem;
                    worstIdx = i;
                }
                steps[steps.length - 1].status = 'potential';
            } else {
                steps[steps.length - 1].status = nextBlocks[i].allocatedProcessId !== null ? 'busy' : 'too_small';
            }
        }
        
        if (worstIdx !== -1) {
            allocatedIdx = worstIdx;
            const selectStep = steps.find(s => s.index === worstIdx);
            if (selectStep) selectStep.status = 'selected';
        }
    }

    // Perform allocation (splitting dynamic partitioning)
    if (allocatedIdx !== -1) {
        const targetBlock = nextBlocks[allocatedIdx];
        const originalSize = targetBlock.size;
        
        if (originalSize > reqSize) {
            // Split block
            targetBlock.size = reqSize;
            targetBlock.allocatedProcessId = procId;
            targetBlock.internalFragmentation = 0;
            
            // Create a new free block representing the remaining space
            const newFreeBlock = {
                id: `Free-${Math.random().toString(36).substr(2, 5)}`,
                start: targetBlock.start + reqSize,
                size: originalSize - reqSize,
                allocatedProcessId: null,
                internalFragmentation: 0
            };
            
            nextBlocks.splice(allocatedIdx + 1, 0, newFreeBlock);
        } else {
            // Perfect fit
            targetBlock.allocatedProcessId = procId;
            targetBlock.internalFragmentation = 0;
        }
    }

    return { blocks: nextBlocks, allocatedIdx, steps };
}

/**
 * Coalesces/merges adjacent free memory blocks.
 * @param {Array} blocks 
 * @returns {Array} Coalesced blocks
 */
function coalesceMemory(blocks) {
    if (blocks.length <= 1) return blocks;
    const nextBlocks = [];
    let current = { ...blocks[0] };
    
    for (let i = 1; i < blocks.length; i++) {
        const b = blocks[i];
        if (current.allocatedProcessId === null && b.allocatedProcessId === null) {
            // Merge them
            current.size += b.size;
        } else {
            nextBlocks.push(current);
            current = { ...b };
        }
    }
    nextBlocks.push(current);
    
    // Re-assign start coordinates to keep correct sorting
    let coord = 0;
    nextBlocks.forEach(b => {
        b.start = coord;
        coord += b.size;
    });
    
    return nextBlocks;
}

// ==========================================
// 3. Page Replacement Algorithms
// ==========================================

/**
 * Simulates page replacement algorithms.
 * @param {string} algorithm - 'fifo', 'lru', 'optimal'
 * @param {Array} pages - Stream of page requests e.g. [7, 0, 1, 2, 0, 3]
 * @param {number} frameCount - Total frames (memory capacity)
 * @returns {Array} List of step details: { page, frames: [...], isHit, replaced: val/null }
 */
function runPageReplacement(algorithm, pages, frameCount) {
    const steps = [];
    let frames = [];
    
    // LRU helper: track last used time
    const lastUsedMap = new Map();
    // FIFO helper: maintain a queue of pages in order of loaded time
    const fifoQueue = [];

    for (let stepIndex = 0; stepIndex < pages.length; stepIndex++) {
        const page = pages[stepIndex];
        const isHit = frames.includes(page);
        let replaced = null;

        if (isHit) {
            // Hit!
            if (algorithm === 'lru') {
                lastUsedMap.set(page, stepIndex);
            }
        } else {
            // Fault!
            if (frames.length < frameCount) {
                // Free frames available
                frames.push(page);
                if (algorithm === 'lru') {
                    lastUsedMap.set(page, stepIndex);
                } else if (algorithm === 'fifo') {
                    fifoQueue.push(page);
                }
            } else {
                // Need page replacement
                if (algorithm === 'fifo') {
                    replaced = fifoQueue.shift();
                    const replaceIdx = frames.indexOf(replaced);
                    frames[replaceIdx] = page;
                    fifoQueue.push(page);
                } 
                else if (algorithm === 'lru') {
                    // Find frame item with minimum last used time
                    let minTime = Infinity;
                    let lruPage = -1;
                    frames.forEach(f => {
                        const time = lastUsedMap.get(f) || 0;
                        if (time < minTime) {
                            minTime = time;
                            lruPage = f;
                        }
                    });
                    replaced = lruPage;
                    const replaceIdx = frames.indexOf(replaced);
                    frames[replaceIdx] = page;
                    lastUsedMap.set(page, stepIndex);
                    lastUsedMap.delete(replaced);
                } 
                else if (algorithm === 'optimal') {
                    // Look into the future page reference stream
                    let maxFutureIndex = -1;
                    let pageToReplace = -1;
                    
                    for (let i = 0; i < frames.length; i++) {
                        const f = frames[i];
                        // Find next occurrence
                        let nextUse = Infinity;
                        for (let j = stepIndex + 1; j < pages.length; j++) {
                            if (pages[j] === f) {
                                nextUse = j;
                                break;
                            }
                        }
                        
                        if (nextUse === Infinity) {
                            // Page never used again, select immediately
                            pageToReplace = f;
                            break;
                        } else if (nextUse > maxFutureIndex) {
                            maxFutureIndex = nextUse;
                            pageToReplace = f;
                        }
                    }
                    
                    replaced = pageToReplace;
                    const replaceIdx = frames.indexOf(replaced);
                    frames[replaceIdx] = page;
                }
            }
        }

        steps.push({
            page,
            frames: [...frames],
            isHit,
            replaced
        });
    }

    return steps;
}

// ==========================================
// 4. Banker's Deadlock Avoidance Algorithm
// ==========================================

/**
 * Calculates safety of resource allocation state.
 * @param {Array} processes - e.g. ['P0', 'P1', 'P2']
 * @param {Array} resources - e.g. ['A', 'B', 'C']
 * @param {Object} totalResources - e.g. { A: 10, B: 5, C: 7 }
 * @param {Array} allocationMatrix - allocationMatrix[i][j] (process idx, resource idx)
 * @param {Array} maxMatrix - maxMatrix[i][j] (process idx, resource idx)
 * @param {Array} availableVector - availableVector[j] (resource idx)
 * @returns {Object} { isSafe: bool, sequence: Array, steps: Array }
 */
function runBankersAlgorithm(processes, resources, totalResources, allocationMatrix, maxMatrix, availableVector) {
    const numP = processes.length;
    const numR = resources.length;
    
    // 1. Calculate Need Matrix
    const needMatrix = [];
    for (let i = 0; i < numP; i++) {
        needMatrix[i] = [];
        for (let j = 0; j < numR; j++) {
            needMatrix[i][j] = maxMatrix[i][j] - allocationMatrix[i][j];
        }
    }

    // 2. Initialize Work and Finish
    const work = [...availableVector];
    const finish = Array(numP).fill(false);
    const safeSequence = [];
    const steps = [];

    let count = 0;
    while (count < numP) {
        let found = false;
        
        for (let i = 0; i < numP; i++) {
            if (!finish[i]) {
                // Check if Need <= Work
                let canAllocate = true;
                const needVals = needMatrix[i];
                const allocationVals = allocationMatrix[i];

                for (let j = 0; j < numR; j++) {
                    if (needVals[j] > work[j]) {
                        canAllocate = false;
                        break;
                    }
                }

                steps.push({
                    process: processes[i],
                    processIndex: i,
                    need: [...needVals],
                    workBefore: [...work],
                    canAllocate,
                    status: canAllocate ? 'success' : 'failed'
                });

                if (canAllocate) {
                    // Update Work = Work + Allocation
                    for (let j = 0; j < numR; j++) {
                        work[j] += allocationVals[j];
                    }
                    finish[i] = true;
                    safeSequence.push(processes[i]);
                    found = true;
                    count++;
                    
                    // Log allocation update in steps
                    steps[steps.length - 1].workAfter = [...work];
                    steps[steps.length - 1].allocation = [...allocationVals];
                    break;
                }
            }
        }

        // If no process could be allocated in this loop, we are in deadlock/unsafe state
        if (!found) {
            break;
        }
    }

    const isSafe = (safeSequence.length === numP);
    return {
        needMatrix,
        isSafe,
        sequence: safeSequence,
        steps
    };
}
