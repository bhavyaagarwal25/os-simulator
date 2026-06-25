#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include "scheduler.h"
#include "bankers.h"

namespace py = pybind11;

PYBIND11_MODULE(os_sim_cpp, m) {
    m.doc() = "C++ Operating System Simulation Library bound to Python via pybind11";

    // Bind Process struct
    py::class_<Process>(m, "Process")
        .def(py::init<>())
        .def_readwrite("id", &Process::id)
        .def_readwrite("arrivalTime", &Process::arrivalTime)
        .def_readwrite("burstTime", &Process::burstTime)
        .def_readwrite("priority", &Process::priority)
        .def_readwrite("remainingTime", &Process::remainingTime)
        .def_readwrite("startTime", &Process::startTime)
        .def_readwrite("completionTime", &Process::completionTime)
        .def_readwrite("turnaroundTime", &Process::turnaroundTime)
        .def_readwrite("waitingTime", &Process::waitingTime)
        .def_readwrite("responseTime", &Process::responseTime);

    // Bind SchedulerResult struct
    py::class_<SchedulerResult>(m, "SchedulerResult")
        .def(py::init<>())
        .def_readonly("timeline", &SchedulerResult::timeline)
        .def_readonly("metrics", &SchedulerResult::metrics);

    // Bind Scheduler class
    py::class_<Scheduler>(m, "Scheduler")
        .def(py::init<>())
        .def("add_process", &Scheduler::addProcess)
        .def("clear", &Scheduler::clear)
        .def("run_fcfs", &Scheduler::runFCFS)
        .def("run_sjf", &Scheduler::runSJF)
        .def("run_priority", &Scheduler::runPriority)
        .def("run_round_robin", &Scheduler::runRoundRobin);

    // Bind BankersResult struct
    py::class_<BankersResult>(m, "BankersResult")
        .def(py::init<>())
        .def_readonly("is_safe", &BankersResult::isSafe)
        .def_readonly("sequence", &BankersResult::sequence)
        .def_readonly("steps", &BankersResult::steps)
        .def_readonly("need_matrix", &BankersResult::needMatrix);

    // Bind Bankers class
    py::class_<Bankers>(m, "Bankers")
        .def(py::init<>())
        .def("setup", &Bankers::setup)
        .def("run_safety_algorithm", &Bankers::runSafetyAlgorithm);
}
