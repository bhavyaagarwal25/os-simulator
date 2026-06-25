#ifndef BANKERS_H
#define BANKERS_H

#include <string>
#include <vector>

struct BankersResult {
    bool isSafe;
    std::vector<std::string> sequence;
    std::vector<std::string> steps;
    std::vector<std::vector<int>> needMatrix;
};

class Bankers {
private:
    std::vector<std::string> processes;
    std::vector<std::string> resources;
    std::vector<std::vector<int>> allocation;
    std::vector<std::vector<int>> maxNeed;
    std::vector<int> available;

public:
    Bankers() = default;
    
    void setup(const std::vector<std::string>& procs, 
               const std::vector<std::string>& res,
               const std::vector<std::vector<int>>& alloc,
               const std::vector<std::vector<int>>& maxN,
               const std::vector<int>& avail);
               
    BankersResult runSafetyAlgorithm();
};

#endif
