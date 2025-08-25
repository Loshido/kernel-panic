#!/bin/bash

# Couleurs (echo -e "${RED} ... ${NC}")
RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # Pas de couleur

# Serveur organisateur
TARGET=http://host.docker.internal

alias config='source /kernel-panic/.config'
alias revenir='cd ..'
alias kp='cd /kernel-panic/'
alias consigne='cat ./consigne'

? () {
  echo -e "${NC}
  Bienvenue dans le kernel-panic
  Voici les commandes mises à disposition par défaut,
   - ${CYAN}?${NC} (ce message)
   - ${CYAN}niv [n]${NC} -> Renvoie vers le niveau n.
   - ${CYAN}chap [n]${NC} -> Renvoie vers le chapitre n dans votre niveau.
   - ${CYAN}groupe [groupe]${NC} -> Enregistre le nom de votre groupe.
   - ${CYAN}consigne${NC} -> Affiche la consigne pour le chapitre/niveau.
   - ${CYAN}envoyer [code]${NC} -> Envoyer un code pour un chapitre/niveau.

  Attention, lorsque vous souhaitez envoyer un code, vous devez vous trouver
  dans le répértoire du chapitre/niveau en question
"
}

# Aller à un niveau donné
niv() {
  if [ $# -ne 1 ]; then
    echo "Usage: niv <numéro>"
    return 1
  fi
  cd "/kernel-panic/niveau-$1" || {
    return 1
  }
}

# Aller à un chapitre donné en fonction du niveau actuel
chap() {
  if [ $# -ne 1 ]; then
    echo "Usage: chap <numéro>"
    return 1
  fi

  local niveau=$(pwd | grep -oE '/kernel-panic/niveau-[1-9]+' | head -n1)

  if [ -z "$niveau" ]; then
    return 1
  fi

  local target="${niveau}/chapitre-$1"

  cd "$target" || {
    return 1
  }
}

# Choisir le groupe pour lequel les points vont.
groupe() {
    if [ -z "$1" ]; then
      if [ ! -f /kernel-panic/.groupe ]; then
        echo "Usage: groupe <nom du groupe>"
      else
        echo "Vous êtes enregistré dans le groupe $(cat /kernel-panic/.groupe )"
      fi
      return
    fi

    local v=$( curl -s "$TARGET/groupe/exist?g=$1" )
    if [[ "$v" = "ye" ]]; then
      echo "$1" > /kernel-panic/.groupe
      echo "Le groupe a été enregistré"
    else
      echo "Ce groupe n'existe pas."
    fi
}

envoyer() {
  # On récupère l'emplacement de l'utilisateur et son groupe
  niveau=$( pwd | grep -oE 'niveau-[1-3]+' | grep -oE '[1-3]+' )
  chapitre=$( pwd | grep -oE 'chapitre-[1-3]+' | grep -oE '[1-3]+' )
  groupe=$( cat /kernel-panic/.groupe )

  if [ $# -ne 1 ]; then
    echo "Usage: envoyer <code>"
    return 1
  elif [ -z "$groupe" ]; then
    echo "Vous devez enregistrer votre groupe!"
    return 1
  elif [ -z "$niveau" ]; then
    echo "Vous n'êtes pas dans niveau!"
    return 1
  fi

  # Information à titre de debug
  echo -e "Niveau $CYAN$niveau$NC"
  if [ "$chapitre" ]; then
    echo -e "Chapitre $CYAN$chapitre$NC"
  fi
  echo -e "Groupe $CYAN$groupe$NC"
  echo -e "Code $CYAN$1$NC"

  # On envoit à l'endpoint /niveau
  if [ -z "$chapitre" ]; then
    v=$( curl -s -X POST "$TARGET/niveau" \
      -H "Content-Type: application/json" \
      -d "{\"niveau\": $niveau, \"code\": \"$1\", \"groupe\": \"$groupe\"}" )
  else
    v=$( curl -s -X POST "$TARGET/niveau" \
      -H "Content-Type: application/json" \
      -d "{\"niveau\": $niveau, \"chapitre\": $chapitre, \"code\": \"$1\", \"groupe\": \"$groupe\"}" )
  fi

  if [[ $v = "ok" ]]; then
    echo -e "\nCode ${GREEN}bon${NC}"
  else
    echo -e "\nRéponse ${RED}\"$v\"${NC}"
  fi
}