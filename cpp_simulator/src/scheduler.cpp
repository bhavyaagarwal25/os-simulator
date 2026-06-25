#include "scheduler.h"
#include <algorithm>
#include <queue>
#include <iostream>

void Scheduler::addProcess(const std::string& id, int arrivalTime, int burstTime, int priority) {
    processes.push_back(Process(id, arrivalTime, burstTime, priority));
}

void Scheduler::clear() {
    processes.clear();
}

std::map<std::string, std::map<std::string, int>> Scheduler::getProcessMetrics(const std::vector<Process>& completedProcs) {
    std::map<std::string, std::map<std::string, int>> result;
    for (const auto& p : completedProcs) {
        std::map<std::string, int> m;
        m["arrival"] = p.arrivalTime;
        m["burst"] = p.burstTime;
        m["priority"] = p.priority;
        m["ct"] = p.completionTime;
        m["tat"] = p.turnaroundTime;
        m["wt"] = p.waitingTime;
        m["rt"] = p.responseTime;
        result[p.id] = m;
    }
    return result;
}

SchedulerResult Scheduler::runFCFS() {
    SchedulerResult result;
    if (processes.empty()) return result;

    // Copy and sort by arrival time
    std::vector<Process> procs = processes;
    std::sort(procs.begin(), procs.end(), [](const Process& a, const Process& b) {
        if (a.arrivalTime != b.arrivalTime) return a.arrivalTime < b.arrivalTime;
        return a.id < b.id;
    });

    int currentTime = 0;
    std::vector<Process> completed;

    for (auto& p : procs) {
        if (currentTime < p.arrivalTime) {
            // Idle time
            while (currentTime < p.arrivalTime) {
                result.timeline.push_back("IDLE");
                currentTime++;
            }
        }

        p.startTime = currentTime;
        p.responseTime = p.startTime - p.arrivalTime;

        for (int i = 0; i < p.burstTime; i++) {
            result.timeline.push_back(p.id);
            currentTime++;
        }

        p.completionTime = currentTime;
        p.turnaroundTime = p.completionTime - p.arrivalTime;
        p.waitingTime = p.turnaroundTime - p.burstTime;
        completed.push_back(p);
    }

    result.metrics = getProcessMetrics(completed);
    return result;
}

SchedulerResult Scheduler::runSJF(bool preemptive) {
    SchedulerResult result;
    if (processes.empty()) return result;

    std::vector<Process> procs = processes;
    int n = procs.size();
    int currentTime = 0;
    int completedCount = 0;
    std::vector<Process> completed;

    if (!preemptive) {
        // Non-preemptive SJF
        std::vector<bool> isCompleted(n, false);
        while (completedCount < n) {
            int selectedIdx = -1;
            int minBurst = 1e9;
            int minArrival = 1e9;

            for (int i = 0; i < n; i++) {
                if (!isCompleted[i] && procs[i].arrivalTime <= currentTime) {
                    if (procs[i].burstTime < minBurst) {
                        minBurst = procs[i].burstTime;
                        minArrival = procs[i].arrivalTime;
                        selectedIdx = i;
                    } else if (procs[i].burstTime == minBurst && procs[i].arrivalTime < minArrival) {
                        minArrival = procs[i].arrivalTime;
                        selectedIdx = i;
                    }
                }
            }

            if (selectedIdx == -1) {
                // CPU Idle
                result.timeline.push_back("IDLE");
                currentTime++;
                continue;
            }

            auto& p = procs[selectedIdx];
            p.startTime = currentTime;
            p.responseTime = currentTime - p.arrivalTime;

            for (int i = 0; i < p.burstTime; i++) {
                result.timeline.push_back(p.id);
                currentTime++;
            }

            p.completionTime = currentTime;
            p.turnaroundTime = p.completionTime - p.arrivalTime;
            p.waitingTime = p.turnaroundTime - p.burstTime;
            
            isCompleted[selectedIdx] = true;
            completed.push_back(p);
            completedCount++;
        }
    } else {
        // Preemptive SJF (SRTF)
        while (completedCount < n) {
            int selectedIdx = -1;
            int minRemaining = 1e9;
            int minArrival = 1e9;

            for (int i = 0; i < n; i++) {
                if (procs[i].remainingTime > 0 && procs[i].arrivalTime <= currentTime) {
                    if (procs[i].remainingTime < minRemaining) {
                        minRemaining = procs[i].remainingTime;
                        minArrival = procs[i].arrivalTime;
                        selectedIdx = i;
                    } else if (procs[i].remainingTime == minRemaining && procs[i].arrivalTime < minArrival) {
                        minArrival = procs[i].arrivalTime;
                        selectedIdx = i;
                    }
                }
            }

            if (selectedIdx == -1) {
                result.timeline.push_back("IDLE");
                currentTime++;
                continue;
            }

            auto& p = procs[selectedIdx];
            if (p.startTime == -1) {
                p.startTime = currentTime;
                p.responseTime = currentTime - p.arrivalTime;
            }

            result.timeline.push_back(p.id);
            p.remainingTime--;
            currentTime++;

            if (p.remainingTime == 0) {
                p.completionTime = currentTime;
                p.turnaroundTime = p.completionTime - p.arrivalTime;
                p.waitingTime = p.turnaroundTime - p.burstTime;
                completed.push_back(p);
                completedCount++;
            }
        }
    }

    result.metrics = getProcessMetrics(completed);
    return result;
}

SchedulerResult Scheduler::runPriority(bool preemptive) {
    SchedulerResult result;
    if (processes.empty()) return result;

    std::vector<Process> procs = processes;
    int n = procs.size();
    int currentTime = 0;
    int completedCount = 0;
    std::vector<Process> completed;

    if (!preemptive) {
        // Non-preemptive Priority (Lower value = Higher priority)
        std::vector<bool> isCompleted(n, false);
        while (completedCount < n) {
            int selectedIdx = -1;
            int minPriority = 1e9;
            int minArrival = 1e9;

            for (int i = 0; i < n; i++) {
                if (!isCompleted[i] && procs[i].arrivalTime <= currentTime) {
                    if (procs[i].priority < minPriority) {
                        minPriority = procs[i].priority;
                        minArrival = procs[i].arrivalTime;
                        selectedIdx = i;
                    } else if (procs[i].priority == minPriority && procs[i].arrivalTime < minArrival) {
                        minArrival = procs[i].arrivalTime;
                        selectedIdx = i;
                    }
                }
            }

            if (selectedIdx == -1) {
                result.timeline.push_back("IDLE");
                currentTime++;
                continue;
            }

            auto& p = procs[selectedIdx];
            p.startTime = currentTime;
            p.responseTime = currentTime - p.arrivalTime;

            for (int i = 0; i < p.burstTime; i++) {
                result.timeline.push_back(p.id);
                currentTime++;
            }

            p.completionTime = currentTime;
            p.turnaroundTime = p.completionTime - p.arrivalTime;
            p.waitingTime = p.turnaroundTime - p.burstTime;
            
            isCompleted[selectedIdx] = true;
            completed.push_back(p);
            completedCount++;
        }
    } else {
        // Preemptive Priority
        while (completedCount < n) {
            int selectedIdx = -1;
            int minPriority = 1e9;
            int minArrival = 1e9;

            for (int i = 0; i < n; i++) {
                if (procs[i].remainingTime > 0 && procs[i].arrivalTime <= currentTime) {
                    if (procs[i].priority < minPriority) {
                        minPriority = procs[i].priority;
                        minArrival = procs[i].arrivalTime;
                        selectedIdx = i;
                    } else if (procs[i].priority == minPriority && procs[i].arrivalTime < minArrival) {
                        minArrival = procs[i].arrivalTime;
                        selectedIdx = i;
                    }
                }
            }

            if (selectedIdx == -1) {
                result.timeline.push_back("IDLE");
                currentTime++;
                continue;
            }

            auto& p = procs[selectedIdx];
            if (p.startTime == -1) {
                p.startTime = currentTime;
                p.responseTime = currentTime - p.arrivalTime;
            }

            result.timeline.push_back(p.id);
            p.remainingTime--;
            currentTime++;

            if (p.remainingTime == 0) {
                p.completionTime = currentTime;
                p.turnaroundTime = p.completionTime - p.arrivalTime;
                p.waitingTime = p.turnaroundTime - p.burstTime;
                completed.push_back(p);
                completedCount++;
            }
        }
    }

    result.metrics = getProcessMetrics(completed);
    return result;
}

SchedulerResult Scheduler::runRoundRobin(int quantum) {
    SchedulerResult result;
    if (processes.empty()) return result;

    std::vector<Process> procs = processes;
    int n = procs.size();
    
    // Sort initially by arrival time to help process selection
    std::sort(procs.begin(), procs.end(), [](const Process& a, const Process& b) {
        return a.arrivalTime < b.arrivalTime;
    });

    std::queue<int> readyQueue;
    std::vector<bool> inQueue(n, false);
    std::vector<Process> completed;
    
    int currentTime = 0;
    int completedCount = 0;
    int checkedIndex = 0;

    // Enqueue initial processes
    while (checkedIndex < n && procs[checkedIndex].arrivalTime <= currentTime) {
        readyQueue.push(checkedIndex);
        inQueue[checkedIndex] = true;
        checkedIndex++;
    }

    while (completedCount < n) {
        if (readyQueue.empty()) {
            if (checkedIndex < n) {
                result.timeline.push_back("IDLE");
                currentTime++;
                while (checkedIndex < n && procs[checkedIndex].arrivalTime <= currentTime) {
                    if (!inQueue[checkedIndex]) {
                        readyQueue.push(checkedIndex);
                        inQueue[checkedIndex] = true;
                    }
                    checkedIndex++;
                }
            } else {
                break;
            }
            continue;
        }

        int idx = readyQueue.front();
        readyQueue.pop();
        inQueue[idx] = false;
        
        auto& p = procs[idx];
        if (p.startTime == -1) {
            p.startTime = currentTime;
            p.responseTime = currentTime - p.arrivalTime;
        }

        int runTime = std::min(p.remainingTime, quantum);
        for (int i = 0; i < runTime; i++) {
            result.timeline.push_back(p.id);
            currentTime++;
            
            // Check for arrivals during this execution tick
            while (checkedIndex < n && procs[checkedIndex].arrivalTime <= currentTime) {
                if (!inQueue[checkedIndex]) {
                    readyQueue.push(checkedIndex);
                    inQueue[checkedIndex] = true;
                }
                checkedIndex++;
            }
        }

        p.remainingTime -= runTime;

        if (p.remainingTime > 0) {
            // Push back to queue
            readyQueue.push(idx);
            inQueue[idx] = true;
        } else {
            p.completionTime = currentTime;
            p.turnaroundTime = p.completionTime - p.arrivalTime;
            p.waitingTime = p.turnaroundTime - p.burstTime;
            completed.push_back(p);
            completedCount++;
        }

        // Just in case check arrivals at end of slot
        while (checkedIndex < n && procs[checkedIndex].arrivalTime <= currentTime) {
            if (!inQueue[checkedIndex]) {
                readyQueue.push(checkedIndex);
                inQueue[checkedIndex] = true;
            }
            checkedIndex++;
        }
    }

    result.metrics = getProcessMetrics(completed);
    return result;
}
