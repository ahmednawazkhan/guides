## Setting C++ on Windows

1. Install Msys2 from [msys2.org](https://www.msys2.org/)
1. Complete the steps and open Msys2
1. Update package databases `pacman -Syu`
1. Update rest of base packages `pacman -Su`
1. Install ***Mingw-w64*** `pacman -S --needed base-devel mingw-w64-x86_64-toolchain`
1. Install ***CMake*** `pacman -S mingw-w64-x86_64-cmake`
1. Install ***Ninja*** `pacman -S mingw-w64-x86_64-ninja`
1. Make sure to launch `MSYS2 MinGW 64-bit` with administrator rights ( ***This is !mportant...!!!***)
   1. make sure you have access to cmake by running `cmake`, g++ by running `g++ --version`