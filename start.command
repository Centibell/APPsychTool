#!/bin/bash
# Double-click to launch Neuromap on macOS: installs dependencies on first run,
# starts the dev server, and opens the app in the default browser.
cd "$(dirname "$0")" || exit 1
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed."
  echo
  echo "Opening https://nodejs.org - install the LTS version, then double-click this file again."
  open "https://nodejs.org"
  echo
  read -n 1 -s -r -p "Press any key to close."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "First launch: installing dependencies. This takes a minute or two..."
  echo
  if ! npm install; then
    echo
    echo "Install failed - see the messages above."
    read -n 1 -s -r -p "Press any key to close."
    exit 1
  fi
fi

echo
echo "Starting Neuromap. Leave this window open while you use it; close it to quit."
echo
npm run dev -- --open
