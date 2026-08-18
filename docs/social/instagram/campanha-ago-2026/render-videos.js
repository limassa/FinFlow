const { spawnSync } = require("child_process");
const path = require("path");
const os = require("os");

const dir = __dirname;
const ffmpeg = path.join(
  os.tmpdir(),
  "claricash-ffmpeg",
  "node_modules",
  "ffmpeg-static",
  "ffmpeg.exe"
);

function run(args, label) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(ffmpeg, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${label} failed with code ${result.status}`);
  }
}

const commonVideo = [
  "-c:v",
  "libx264",
  "-preset",
  "medium",
  "-crf",
  "20",
  "-pix_fmt",
  "yuv420p",
  "-c:a",
  "aac",
  "-b:a",
  "128k",
  "-shortest",
  "-movflags",
  "+faststart",
];

const prep9x16 =
  "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30";
const prep1x1 =
  "scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,setsar=1,fps=30";

run(
  [
    "-y",
    "-loop",
    "1",
    "-t",
    "5",
    "-i",
    path.join(dir, "story-01-claras.png"),
    "-loop",
    "1",
    "-t",
    "5",
    "-i",
    path.join(dir, "story-02-contas.png"),
    "-loop",
    "1",
    "-t",
    "5",
    "-i",
    path.join(dir, "story-03-comece.png"),
    "-f",
    "lavfi",
    "-t",
    "14",
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-filter_complex",
    `[0:v]${prep9x16}[v0];[1:v]${prep9x16}[v1];[2:v]${prep9x16}[v2];[v0][v1]xfade=transition=fade:duration=0.5:offset=4.5[ab];[ab][v2]xfade=transition=fade:duration=0.5:offset=9,format=yuv420p[v]`,
    "-map",
    "[v]",
    "-map",
    "3:a",
    ...commonVideo,
    path.join(dir, "reel-financas-claras.mp4"),
  ],
  "Reel 9:16 (3 stories)"
);

run(
  [
    "-y",
    "-loop",
    "1",
    "-i",
    path.join(dir, "ad-01-cta-portrait.png"),
    "-f",
    "lavfi",
    "-t",
    "8",
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-filter_complex",
    "scale=2400:-1,zoompan=z='min(zoom+0.0012,1.12)':d=240:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1440:fps=30,format=yuv420p[v]",
    "-map",
    "[v]",
    "-map",
    "1:a",
    "-t",
    "8",
    ...commonVideo,
    path.join(dir, "ad-cta-portrait.mp4"),
  ],
  "Anúncio 3:4 (zoom)"
);

run(
  [
    "-y",
    "-loop",
    "1",
    "-t",
    "4",
    "-i",
    path.join(dir, "feed-01-disponivel.png"),
    "-loop",
    "1",
    "-t",
    "4",
    "-i",
    path.join(dir, "feed-02-planilha.png"),
    "-loop",
    "1",
    "-t",
    "4",
    "-i",
    path.join(dir, "feed-05-ios.png"),
    "-f",
    "lavfi",
    "-t",
    "12",
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-filter_complex",
    `[0:v]${prep1x1}[v0];[1:v]${prep1x1}[v1];[2:v]${prep1x1}[v2];[v0][v1]xfade=transition=fade:duration=0.4:offset=3.6[ab];[ab][v2]xfade=transition=fade:duration=0.4:offset=7.2,format=yuv420p[v]`,
    "-map",
    "[v]",
    "-map",
    "3:a",
    ...commonVideo,
    path.join(dir, "ad-feed-slideshow.mp4"),
  ],
  "Anúncio feed 1:1"
);

run(
  [
    "-y",
    "-loop",
    "1",
    "-i",
    path.join(dir, "reel-cover-sobrou.png"),
    "-f",
    "lavfi",
    "-t",
    "8",
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-filter_complex",
    "scale=2160:-1,zoompan=z='min(zoom+0.0015,1.15)':d=240:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30,format=yuv420p[v]",
    "-map",
    "[v]",
    "-map",
    "1:a",
    "-t",
    "8",
    ...commonVideo,
    path.join(dir, "reel-quanto-sobrou.mp4"),
  ],
  "Reel capa 9:16 (zoom)"
);

console.log("\nVideos prontos.");
