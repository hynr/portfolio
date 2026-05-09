#!/bin/bash

# Portfolio Game Development - Launch Script
# Opens 4 terminal panes for parallel development

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Portfolio Game Development Launcher${NC}"
echo "Setting up 4 development lanes..."

# Check if tmux is installed
if command -v tmux &> /dev/null; then
    echo -e "${BLUE}Using tmux for terminal management...${NC}"
    
    # Kill existing session if it exists
    tmux kill-session -t portfolio-dev 2>/dev/null
    
    # Create new tmux session with 4 panes
    tmux new-session -d -s portfolio-dev -n main -c "$(pwd)"
    
    # Split into 4 panes (2x2 grid)
    tmux split-window -h -t portfolio-dev:main -c "../portfolio-level"
    tmux split-window -v -t portfolio-dev:main.0 -c "../portfolio-feel"
    tmux split-window -v -t portfolio-dev:main.1 -c "../portfolio-audio-nav"
    
    # Rename panes for clarity
    tmux select-pane -t portfolio-dev:main.0 -T "MAIN (Review/Merge)"
    tmux select-pane -t portfolio-dev:main.1 -T "LEVEL DESIGN"
    tmux select-pane -t portfolio-dev:main.2 -T "ANIMATIONS & PHYSICS"
    tmux select-pane -t portfolio-dev:main.3 -T "AUDIO & NAVIGATION"
    
    # Send commands to each pane
    tmux send-keys -t portfolio-dev:main.0 "echo -e '${GREEN}MAIN WORKTREE - Review & Merge${NC}'" C-m
    tmux send-keys -t portfolio-dev:main.0 "echo 'Branch: main'" C-m
    tmux send-keys -t portfolio-dev:main.0 "echo 'Use this to review and merge work from other lanes'" C-m
    tmux send-keys -t portfolio-dev:main.0 "git status" C-m
    
    tmux send-keys -t portfolio-dev:main.1 "echo -e '${YELLOW}LEVEL DESIGN LANE${NC}'" C-m
    tmux send-keys -t portfolio-dev:main.1 "echo 'Branch: feat/level-design'" C-m
    tmux send-keys -t portfolio-dev:main.1 "echo 'Read PROMPT.md for your tasks'" C-m
    tmux send-keys -t portfolio-dev:main.1 "cat PROMPT.md | head -20" C-m
    
    tmux send-keys -t portfolio-dev:main.2 "echo -e '${BLUE}ANIMATIONS & PHYSICS LANE${NC}'" C-m
    tmux send-keys -t portfolio-dev:main.2 "echo 'Branch: feat/animations-physics'" C-m
    tmux send-keys -t portfolio-dev:main.2 "echo 'Read PROMPT.md for your tasks'" C-m
    tmux send-keys -t portfolio-dev:main.2 "cat PROMPT.md | head -20" C-m
    
    tmux send-keys -t portfolio-dev:main.3 "echo -e '${RED}AUDIO & NAVIGATION LANE${NC}'" C-m
    tmux send-keys -t portfolio-dev:main.3 "echo 'Branch: feat/audio-and-pipes'" C-m
    tmux send-keys -t portfolio-dev:main.3 "echo 'Read PROMPT.md for your tasks'" C-m
    tmux send-keys -t portfolio-dev:main.3 "cat PROMPT.md | head -20" C-m
    
    # Attach to the session
    echo -e "${GREEN}✅ Tmux session 'portfolio-dev' created!${NC}"
    echo "Attaching to session..."
    tmux attach-session -t portfolio-dev
    
elif [[ "$TERM_PROGRAM" == "iTerm.app" ]]; then
    echo -e "${BLUE}Using iTerm2 AppleScript for terminal management...${NC}"
    
    # Use AppleScript to create iTerm2 panes
    osascript <<EOF
    tell application "iTerm"
        activate
        
        -- Create new window
        create window with default profile
        tell current window
            -- Main pane (top left)
            tell current session
                write text "cd $(pwd)"
                write text "echo 'MAIN WORKTREE - Review & Merge'"
                write text "echo 'Branch: main'"
                write text "git status"
            end tell
            
            -- Level Design pane (top right)
            tell current session
                set levelPane to (split vertically with default profile)
                tell levelPane
                    write text "cd ../portfolio-level"
                    write text "echo 'LEVEL DESIGN LANE'"
                    write text "echo 'Branch: feat/level-design'"
                    write text "cat PROMPT.md | head -20"
                end tell
            end tell
            
            -- Animations & Physics pane (bottom left)
            tell current session
                set physicsPane to (split horizontally with default profile)
                tell physicsPane
                    write text "cd ../portfolio-feel"
                    write text "echo 'ANIMATIONS & PHYSICS LANE'"
                    write text "echo 'Branch: feat/animations-physics'"
                    write text "cat PROMPT.md | head -20"
                end tell
            end tell
            
            -- Audio & Navigation pane (bottom right)
            tell session 2
                set audioPane to (split horizontally with default profile)
                tell audioPane
                    write text "cd ../portfolio-audio-nav"
                    write text "echo 'AUDIO & NAVIGATION LANE'"
                    write text "echo 'Branch: feat/audio-and-pipes'"
                    write text "cat PROMPT.md | head -20"
                end tell
            end tell
        end tell
    end tell
EOF
    
    echo -e "${GREEN}✅ iTerm2 panes created!${NC}"
    
else
    echo -e "${YELLOW}Neither tmux nor iTerm2 detected. Opening in separate terminal windows...${NC}"
    
    # Fallback: Open in separate terminal windows
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e 'tell app "Terminal" to do script "cd $(pwd) && echo \"MAIN WORKTREE\" && git status"'
        osascript -e 'tell app "Terminal" to do script "cd ../portfolio-level && echo \"LEVEL DESIGN LANE\" && cat PROMPT.md | head -20"'
        osascript -e 'tell app "Terminal" to do script "cd ../portfolio-feel && echo \"ANIMATIONS & PHYSICS LANE\" && cat PROMPT.md | head -20"'
        osascript -e 'tell app "Terminal" to do script "cd ../portfolio-audio-nav && echo \"AUDIO & NAVIGATION LANE\" && cat PROMPT.md | head -20"'
    else
        # Linux/Other
        echo "Please manually open 4 terminal windows and navigate to:"
        echo "  1. $(pwd) (main)"
        echo "  2. ../portfolio-level"
        echo "  3. ../portfolio-feel"
        echo "  4. ../portfolio-audio-nav"
    fi
fi

echo ""
echo -e "${GREEN}📋 Development lanes are ready!${NC}"
echo ""
echo "Each lane has:"
echo "  - CONTRACT.md: The frozen interface (DO NOT MODIFY)"
echo "  - PROMPT.md: Lane-specific instructions"
echo ""
echo "Workflow:"
echo "  1. Each lane works independently on their branch"
echo "  2. Follow file ownership rules in CONTRACT.md"
echo "  3. Merge to main when ready"
echo ""
echo -e "${YELLOW}Happy coding! 🎮${NC}"