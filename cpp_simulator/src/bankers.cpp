#include "bankers.h"
#include <sstream>

void Bankers::setup(const std::vector<std::string>& procs, 
                    const std::vector<std::string>& res,
                    const std::vector<std::vector<int>>& alloc,
                    const std::vector<std::vector<int>>& maxN,
                    const std::vector<int>& avail) {
    processes = procs;
    resources = res;
    allocation = alloc;
    maxNeed = maxN;
    available = avail;
}

BankersResult Bankers::runSafetyAlgorithm() {
    BankersResult result;
    int numP = processes.size();
    int numR = resources.size();

    if (numP == 0 || numR == 0) {
        result.isSafe = false;
        return result;
    }

    // 1. Calculate Need Matrix
    result.needMatrix.resize(numP, std::vector<int>(numR, 0));
    for (int i = 0; i < numP; i++) {
        for (int j = 0; j < numR; j++) {
            result.needMatrix[i][j] = maxNeed[i][j] - allocation[i][j];
        }
    }

    // 2. Safety logic variables
    std::vector<int> work = available;
    std::vector<bool> finish(numP, false);
    int completedCount = 0;

    while (completedCount < numP) {
        bool found = false;

        for (int i = 0; i < numP; i++) {
            if (!finish[i]) {
                // Check if Need <= Work
                bool canAllocate = true;
                std::stringstream logMsg;
                
                logMsg << processes[i] << ": Need [";
                for (int j = 0; j < numR; j++) {
                    logMsg << result.needMatrix[i][j] << (j == numR - 1 ? "" : ", ");
                }
                logMsg << "] vs Available [";
                for (int j = 0; j < numR; j++) {
                    logMsg << work[j] << (j == numR - 1 ? "" : ", ");
                }
                logMsg << "]";

                for (int j = 0; j < numR; j++) {
                    if (result.needMatrix[i][j] > work[j]) {
                        canAllocate = false;
                        break;
                    }
                }

                if (canAllocate) {
                    // Update Work = Work + Allocation
                    logMsg << " - SUCCESS. Process runs and releases Allocation [";
                    for (int j = 0; j < numR; j++) {
                        logMsg << allocation[i][j] << (j == numR - 1 ? "" : ", ");
                        work[j] += allocation[i][j];
                    }
                    logMsg << "]. New Available: [";
                    for (int j = 0; j < numR; j++) {
                        logMsg << work[j] << (j == numR - 1 ? "" : ", ");
                    }
                    logMsg << "]";

                    finish[i] = true;
                    result.sequence.push_back(processes[i]);
                    found = true;
                    completedCount++;
                    
                    result.steps.push_back(logMsg.str());
                    break;
                } else {
                    logMsg << " - FAILED (Insufficient resources. Process must wait).";
                    result.steps.push_back(logMsg.str());
                }
            }
        }

        // If no progress made, deadlock/unsafe state exists
        if (!found) {
            break;
        }
    }

    result.isSafe = (completedCount == numP);
    return result;
}
