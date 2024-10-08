---
layout: post
title: 🪄 Spells for Linux Shell
description: 
summary: 
tags: linux shell script bash
minute: 20
---

## 🪄 Spells for Linux Shell

### 1. loop command x script

#### command

```sh
for i in {1..5}; do echo $i; done

count=1; while [ $count -le 5 ]; do echo $count; ((count++)); done
```

#### script

```bash
#!/bin/bash

echo "Counting to 5 with a for loop:"
for i in {1..5}; do
    echo $i
done

echo "Counting to 5 with a while loop:"
count=1
while [ $count -le 5 ]; do
    echo $count
    ((count++))
done
```

### 2. signals

#### SIGINT
This script creates a temporary file and displays a goodbye message when it receives a SIGINT signal (e.g., when the user presses Ctrl+C).

```bash
#!/bin/bash

# Function that will be called when the script receives the SIGINT signal
function exitMsg {
    echo "you sent a signal to end, byby !!"
    # command here
    exit
}

# Sets up the trap to call the cleanup function when the script receives SIGINT
trap exitMsg SIGINT

sleep 5

echo "Creating a temporary file..."
touch /tmp/apolzek || exit 1  # Creates a temporary file or exits with an error
```

#### SIGTERM
This script starts a web server that runs indefinitely and shuts down gracefully when it receives a SIGTERM signal. `kill <PID>`

```bash
#!/bin/bash

# Function called upon receiving SIGTERM
function terminateMsg {
    echo "Received SIGTERM, shutting down the server gracefully..."
    # Here you can add commands to close connections or save the state
    exit
}

# Sets up the trap for SIGTERM
trap terminateMsg SIGTERM

echo "Starting web server..."
while true; do
    echo "Server is running... (PID: $$)"
    sleep 2  # Simulates the server's running time
done
```

#### SIGHUB
This script starts a daemon that runs indefinitely and reloads its configuration when it receives a SIGHUP signal. `kill -HUP <PID>`

```bash
#!/bin/bash

# Function called upon receiving SIGHUP
function reloadMsg {
    echo "Received SIGHUP, reloading configuration..."
    # Here you can add commands to reload the configurations
    # Example: source /etc/mydaemon/config.conf
}

# Sets up the trap for SIGHUP
trap reloadMsg SIGHUP

echo "Starting my daemon..."
while true; do
    echo "Daemon is running... (PID: $$)"
    sleep 5  # Simulates the daemon's running time
done
```

### 3. background processes

```bash
#!/bin/bash

echo "Starting background processes..."

# Process 1
sleep 3 &  # This simulates a long-running task
pid1=$!  # Get the process ID of process 1

# Process 2
sleep 9 &  # This simulates a shorter task
pid2=$!  # Get the process ID of process 2

# Wait for process 1 to finish and notify
wait $pid1
echo "Process 1 has completed."

# Wait for process 2 to finish and notify
wait $pid2
echo "Process 2 has completed."

echo "All processes have finished."
```

### 4. debugging

```bash
#!/bin/bash

set -x  # Enable debugging mode

echo "Starting the script..."
echo "Doing something..."
sleep 1
echo "Ending the script."

set +x  # Disable debugging mode

echo "now debugging mode is disable"
echo "did you understand ?"
```