#!/bin/bash

NC='\[\033[00m\]'
CYAN='\[\033[01;36m\]'

# root@kernel-panic # ...
PS1='\[\033[01;36m\]\u\[\033[00m\]@\W\$ '


# Démarrage
source /kernel-panic/.config # emplacement du fichier kernel-panic.sh
cd /kernel-panic/
?  # <- fonction aide 