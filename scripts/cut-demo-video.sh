#!/usr/bin/env bash
# Cuts the raw screen recording into the demo video used for launch listings.
#
#   scripts/cut-demo-video.sh "<raw-recording.webm>" [output-dir]
#
# Produces, in the output directory (default: the current directory):
#   demo-1080p.mp4  ~48s, 1920x1080, captioned - the one to upload to YouTube
#   demo-loop.mp4   8s silent loop of the answer, for X and Reddit
#   demo-loop.gif   the same 6s as a GIF, for places that still insist
#   demo-poster.png a single frame on the ranked-answer beat
#
# The raw recording is not in the repository: it is 21 MB of VP8 at 2130x1357,
# and only these derivatives are worth keeping. Re-record with the same browser
# window size or the crop below needs redoing.
#
# Why each choice:
#   * crop=1627:1330:503:0 removes the desktop visible to the left of the browser
#     window. Without it the UI ends up about a third of the frame.
#   * Segments are sped up individually. Typing and page loads are dead time; the
#     moments where availability appears are not.
#   * Captions are burned in because the recording has no audio, so the story has
#     to be readable with the sound off - which is how it is watched anyway.
#   * No colons in caption text. ffmpeg's drawtext treats them as option
#     separators and silently truncates the caption at the colon.
set -euo pipefail

RAW="${1:?usage: cut-demo-video.sh <raw-recording.webm> [output-dir]}"
OUT_DIR="${2:-.}"
FONT="${WEGOWHEN_FONT:-$HOME/.cache/wegowhen-fonts/dmsans.ttf}"
CROP="crop=1627:1330:503:0"

[ -f "$FONT" ] || { echo "font not found at $FONT - run scripts/generate-og-image.py once to fetch it" >&2; exit 1; }

mkdir -p "$OUT_DIR"
FC="$(mktemp)"
trap 'rm -f "$FC"' EXIT

# start end speed caption
SEGMENTS=(
  "4.0   16.5  1.5  One link. No accounts."
  "20.5  25.5  1.2  The organiser picks the window"
  "26.0  38.0  1.25 Tap the days you are free"
  "45.0  57.0  1.4  Everyone marks their own"
  "86.0  100.0 1.5  The heat map shows who is free"
  "116.0 124.5 1.0  Ranked date ranges, not a grid"
)

i=0
labels=""
for spec in "${SEGMENTS[@]}"; do
  read -r start end speed caption <<<"$spec"
  printf '[0:v]trim=start=%s:end=%s,setpts=(PTS-STARTPTS)/%s,%s,' "$start" "$end" "$speed" "$CROP" >> "$FC"
  printf 'drawbox=x=0:y=ih-118:w=iw:h=118:color=0x2b1f16@0.86:t=fill,' >> "$FC"
  printf "drawtext=fontfile='%s':text='%s':x=(w-text_w)/2:y=h-82:fontsize=42:fontcolor=0xfcfaf6[v%d];\n" \
    "$FONT" "$caption" "$i" >> "$FC"
  labels="${labels}[v${i}]"
  i=$((i + 1))
done

printf '%sconcat=n=%d:v=1:a=0[cat];\n' "$labels" "$i" >> "$FC"
printf '[cat]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0xfcfaf6,fps=30[outv]\n' >> "$FC"

ffmpeg -y -v error -i "$RAW" -filter_complex_script "$FC" -map '[outv]' \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart \
  "$OUT_DIR/demo-1080p.mp4"

ffmpeg -y -v error -ss 116.5 -t 8 -i "$RAW" -an \
  -vf "${CROP},scale=1280:720:force_original_aspect_ratio=decrease:flags=lanczos,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0xfcfaf6,fps=30" \
  -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart \
  "$OUT_DIR/demo-loop.mp4"

ffmpeg -y -v error -ss 117 -t 6 -i "$RAW" \
  -vf "${CROP},scale=760:-1:flags=lanczos,fps=12,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=3" \
  "$OUT_DIR/demo-loop.gif"

ffmpeg -y -v error -ss 44 -i "$OUT_DIR/demo-1080p.mp4" -frames:v 1 "$OUT_DIR/demo-poster.png"

for f in demo-1080p.mp4 demo-loop.mp4 demo-loop.gif demo-poster.png; do
  printf '%-18s %s\n' "$f" "$(du -h "$OUT_DIR/$f" | cut -f1)"
done
