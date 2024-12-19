# Get video duration in seconds using ffprobe
input_video="$1"
if [ -z "$input_video" ]; then
  echo "Usage: $0 <video_file>"
  exit 1
fi

# Check if file exists
if [ ! -f "$input_video" ]; then
  echo "Error: File '$input_video' not found"
  exit 1
fi

# Extract filename without extension and create timestamp
filename=$(basename "$input_video")
filename_noext="${filename%.*}"
timestamp=$(date +"%Y%m%d_%H%M%S")

# Get duration and check if ffprobe succeeded
duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$input_video")
if [ $? -ne 0 ] || [ -z "$duration" ]; then
  echo "Error: Could not get video duration"
  exit 1
fi
duration=${duration%.*}  # Remove decimal part

# Calculate total frames (at 5fps)
total_frames=$((duration * 5))

# Calculate grid dimensions (trying to keep it roughly square)
grid_width=$(echo "sqrt($total_frames)" | bc)
grid_width=${grid_width%.*}  # Round down
if [ "$grid_width" -eq 0 ]; then
  grid_width=1  # Ensure at least 1x1 grid
fi
grid_height=$(((total_frames + grid_width - 1) / grid_width))  # Ceiling division

echo "Video duration: $duration seconds"
echo "Total frames: $total_frames"
echo "Grid: ${grid_width}x${grid_height}"

# Create output directory if it doesn't exist
output_dir="$(dirname "$input_video")/frames"
mkdir -p "$output_dir"

# Run ffmpeg with calculated dimensions and better quality
ffmpeg -i "$input_video" \
  -vf "fps=5,scale=240:135,tile=${grid_width}x${grid_height}:padding=4:margin=8:color=black" \
  -frames:v 1 -update 1 \
  -q:v 1 -qmin 1 -qmax 1 \
  "$output_dir/${filename_noext}_${timestamp}_montage.jpg"