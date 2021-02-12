## Install Nvidia drivers on Centos

### Install NVidia pre-requisites
`dnf install kernel-devel kernel-headers gcc make dkms acpid libglvnd-glx libglvnd-opengl libglvnd-devel pkgconfig grub2-tools
`

`dnf install https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm
dnf install https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm`

`dnf update`

### Update kernel for HDML fix 
from testing https://major.io/2018/02/28/install-testing-kernels-in-fedora/

`dnf update kernel* --enablerepo=updates-testing`
### Install nvidia driver

`dnf install akmod-nvidia`

`sudo reboot now` 

wait for driver to compile/install automatically

### Author
- Sohaib Athar