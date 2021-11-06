## Installing C++ Boost Libraries on Windows

* This Guide assumes that you have installed msys2, mingw-64 using this link ...
* This guide was made with the help of https://gist.github.com/sim642/29caef3cc8afaa273ce6 


1. Download boost from https://www.boost.org/users/download/
2. Extract the contents to `/c/downloads/boost_1_77_0`
3. Create a folder within for building. `/c/downloads/boost_1_77_0/build`
4. Create a folder for Boost Build installation `/c/downloads/boost-build`
5. Create a folder for installation `/c/libs/boost`
6. Make sure `g++ --version` is successfuly running
7. Open `Msys2 Mingw 64-bit` with administrative rights
8. Navigate to `/c/downloads/boost_1_77_0/tools/build`
9. Run `./bootstrap.bat mingw`
10. Run `./b2 install --prefix="/c/downloads/boost-build"`
11. Add `/c/downloads/boost-build/bin` to Windows PATH.
12. In order for msys2 to have windows environment variables, add `MSYS2_PATH_TYPE=inherit` variable to windows environment.
13. Close `Msys2` and restart using administrative rights
14. Verify that you can access `b2` and windows env variables are picked up by Msys2
15. Navigate to `/c/downloads/boost_1_77_0`
16. Run `b2 --build-dir="/c/downloads/boost_1_77_0/build" --prefix="/c/libs/boost" toolset=gcc install`
17. After Installation is complete go to your project and go to its `build` folder
18. Run `cmake -DBOOST_ROOT="/c/libs/boost" path_to_cmakelist`
19. Cmake will cache `BOOST_ROOT` and next time when you run `cmake path_to_cmakelist` will not require `DBOOST_ROOT="/c/libs/boost` parameter