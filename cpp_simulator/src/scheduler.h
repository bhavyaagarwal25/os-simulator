#ifndef SCHEDULER_H
#define SCHEDULER_H

#include <string>
#include <vector>
#include <map>

struct Process {
    std::string id;
    int arrivalTime;
    int burstTime;
    int priority;
    int remainingTime;
    int startTime;
    int completionTime;
    int turnaroundTime;
    int waitingTime;
    int responseTime;

    // C++11 compatible constructor
    Process(std::string id_, int arr_, int burst_, int prio_)
        : id(id_), arrivalTime(arr_), burstTime(burst_), priority(prio_),
          remainingTime(burst_), startTime(-1), completionTime(0),
          turnaroundTime(0), waitingTime(0), responseTime(-1) {}
          
    Process() : id(""), arrivalTime(0), burstTime(0), priority(0),
                remainingTime(0), startTime(-1), completionTime(0),
                turnaroundTime(0), waitingTime(0), responseTime(-1) {}
};

struct SchedulerResult {
    std::vector<std::string> timeline;
    std::map<std::string, std::map<std::string, int>> metrics;
};

class Scheduler {
private:
    std::vector<Process> processes;

public:
    Scheduler() = default;
    
    void addProcess(const std::string& id, int arrivalTime, int burstTime, int priority);
    void clear();
    
    SchedulerResult runFCFS();
    SchedulerResult runSJF(bool preemptive);
    SchedulerResult runPriority(bool preemptive);
    SchedulerResult runRoundRobin(int quantum);
    
    std::map<std::string, std::map<std::string, int>> getProcessMetrics(const std::vector<Process>& completedProcs);
};

#endif
