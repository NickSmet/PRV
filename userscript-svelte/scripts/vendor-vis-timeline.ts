import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

type SnapshotFile = {
  srcRel: string;
  destRel: string;
};

async function main() {
  const require = createRequire(import.meta.url);

  const pkgJsonPath = require.resolve('vis-timeline/package.json', { paths: [process.cwd()] });
  const pkgDir = path.dirname(pkgJsonPath);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const pkg = (await import(pkgJsonPath, { with: { type: 'json' } } as any)) as any;
  const version: string = String(pkg?.default?.version ?? pkg?.version ?? 'unknown');

  const destRoot = path.resolve(process.cwd(), 'docs/vendor/vis-timeline');

  const files: SnapshotFile[] = [
    { srcRel: 'README.md', destRel: 'README.upstream.md' },
    { srcRel: 'LICENSE.MIT.txt', destRel: 'LICENSE.MIT.txt' },
    { srcRel: 'LICENSE.Apache-2.0.txt', destRel: 'LICENSE.Apache-2.0.txt' },
    { srcRel: 'types/index.d.ts', destRel: 'types/index.d.ts' }
  ];

  await mkdir(destRoot, { recursive: true });
  await mkdir(path.join(destRoot, 'types'), { recursive: true });

  for (const file of files) {
    const src = path.join(pkgDir, file.srcRel);
    const dest = path.join(destRoot, file.destRel);
    await copyFile(src, dest);
  }

  await writeFile(
    path.join(destRoot, 'VERSION.txt'),
    [
      `vis-timeline version: ${version}`,
      `source: ${pkgDir}`,
      `generatedAt: ${new Date().toISOString()}`,
      ''
    ].join('\n'),
    'utf8'
  );

  // eslint-disable-next-line no-console
  console.log(`[vendor-vis-timeline] Snapshot updated: ${destRoot}`);
}

await main();

