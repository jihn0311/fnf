// Run: node build-deploy.cjs (Windows, no dependencies)
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const root = __dirname;
const output = path.join(root, 'dist');
const archive = path.join(root, 'neon-duet-deploy.zip');
const files = [
  'index.html', 'style.css', 'game.js', 'imported-chart.js',
  'assets/self-embodiment.mp3', 'assets/self-embodiment-inline.js',
];

files.push(...JSON.parse(fs.readFileSync(path.join(root,'mod-assets.json'),'utf8')));

function assertLocal(file) {
  // OneDrive cloud files can be reported as links; check the resolved destination.
  if (fs.realpathSync(file).toLowerCase() !== path.resolve(file).toLowerCase()) {
    throw new Error(`Unexpected redirected path: ${file}`);
  }
}
function inspect(dir, prefix = '') {
  if (!fs.existsSync(dir)) return;
  assertLocal(dir);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    const full = path.join(dir, entry.name);
    assertLocal(full);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && files.some(file => file.startsWith(relative + '/'))) {
      inspect(path.join(dir, entry.name), relative + '/');
    } else if (!stat.isFile() || !files.includes(relative)) {
      throw new Error(`Unexpected file in dist; move it out before packaging: ${relative}`);
    }
  }
}

// Never delete unrelated files or silently include them in the published archive.
inspect(output);
for (const file of files) {
  if (!fs.statSync(path.join(root, file)).isFile()) throw new Error(`Missing source: ${file}`);
}
if (fs.existsSync(archive)) assertLocal(archive);
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
for (const file of files) {
  const destination = path.join(output, file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, file), destination);
  if (hash(destination) !== hash(path.join(root, file))) throw new Error(`Copy failed: ${file}`);
}

const result = spawnSync('powershell.exe', [
  '-NoProfile', '-NonInteractive', '-Command',
  "$ErrorActionPreference = 'Stop'; Add-Type -AssemblyName System.IO.Compression.FileSystem; $temporaryZip = $env:NEON_DEPLOY_ZIP + '.tmp'; if (Test-Path -LiteralPath $temporaryZip) { throw 'Temporary archive already exists' }; $package = [IO.Compression.ZipFile]::Open($temporaryZip, 'Create'); try { foreach ($item in [IO.Directory]::GetFiles($env:NEON_DEPLOY_DIR, '*', 'AllDirectories')) { $name = $item.Substring($env:NEON_DEPLOY_DIR.Length + 1).Replace([char]92, [char]47); [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($package, $item, $name) } } finally { $package.Dispose() }; [IO.File]::Copy($temporaryZip, $env:NEON_DEPLOY_ZIP, $true); [IO.File]::Delete($temporaryZip)",
], {
  env: { ...process.env, NEON_DEPLOY_DIR: output, NEON_DEPLOY_ZIP: archive },
  stdio: 'inherit', windowsHide: true,
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
console.log(`Ready: ${output}\nZIP: ${archive}\n${files.length} game files packaged.`);
