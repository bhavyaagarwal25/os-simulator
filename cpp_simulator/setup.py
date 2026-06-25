from setuptools import setup
from pybind11.setup_helpers import Pybind11Extension, build_ext

ext_modules = [
    Pybind11Extension(
        "os_sim_cpp",
        [
            "src/scheduler.cpp",
            "src/bankers.cpp",
            "src/bindings.cpp"
        ],
        include_dirs=["src"],
        cxx_std=11,
    ),
]

setup(
    name="os_sim_cpp",
    version="1.0.0",
    description="Python bindings for C++ OS Scheduler and Bankers safety algorithms",
    ext_modules=ext_modules,
    cmdclass={"build_ext": build_ext},
    zip_safe=False,
)
