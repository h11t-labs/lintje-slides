// The two scripts of a release, each in a repository of its own: what `npm run release` makes of
// changes/ and the changelog, and the notes a tag is published with.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, describe, it } from 'node:test'
import { IDENTITY, node, project, repo } from './helpers.mjs'

const REPOSITORY = 'https://github.com/h11t-labs/lintje-slides'
const changelog = (unreleased = '') => `# Changelog

Wat er veranderde, per versie.

## [Unreleased]
${unreleased}
## [0.2.0] - 2026-11-27

### Toegevoegd

- Een bundel. (#11)

## [0.1.0] - 2026-11-26

### Toegevoegd

- De eerste versie.

[unreleased]: ${REPOSITORY}/compare/v0.2.0...HEAD
[0.2.0]: ${REPOSITORY}/compare/v0.1.0...v0.2.0
[0.1.0]: ${REPOSITORY}/releases/tag/v0.1.0
`
const manifest = JSON.stringify({ name: 'proef', version: '0.2.0' })
const lock = JSON.stringify({ name: 'proef', version: '0.2.0', lockfileVersion: 3, requires: true, packages: { '': { name: 'proef', version: '0.2.0' } } })

describe('npm run release', () => {
  let folder
  afterEach(() => folder?.remove())

  const git = (...args) => execFileSync('git', args, { cwd: folder.dir, encoding: 'utf8', env: { ...process.env, ...IDENTITY } }).trim()
  /** A repository with one commit: the package, the changelog and these other files. */
  const repository = async (files = {}, unreleased) => {
    folder = await project({ 'package.json': manifest, 'package-lock.json': lock, 'CHANGELOG.md': changelog(unreleased), ...files })
    git('init', '-q', '-b', 'main')
    git('add', '.')
    git('commit', '-q', '-m', 'Begin')
  }
  const release = (version) => node(folder.dir, join(repo, 'scripts/release.mjs'), ...(version ? [version] : []))

  it('turns changes/ and [Unreleased] into the section of the version, per kind and the newest first', async () => {
    await repository(
      {
        'changes/14-een-indeling.md': '### Toegevoegd\n\n- Een indeling. (#14)\n',
        'changes/15-twee-soorten.md': '### Opgelost\n\n- Een fout. (#15)\n\n### Toegevoegd\n\n- Een veld. (#15)\n',
        'changes/README.txt': 'Geen regel.',
      },
      '\n### Gewijzigd\n\n- Met de hand geschreven.\n',
    )
    const { code, stdout } = await release('0.3.0')
    assert.equal(code, 0, stdout)
    const today = new Date().toISOString().slice(0, 10)
    assert.equal(
      await readFile(join(folder.dir, 'CHANGELOG.md'), 'utf8'),
      changelog()
        .replace(
          '## [Unreleased]\n',
          `## [Unreleased]\n\n## [0.3.0] - ${today}\n\n### Toegevoegd\n\n- Een veld. (#15)\n- Een indeling. (#14)\n\n### Gewijzigd\n\n- Met de hand geschreven.\n\n### Opgelost\n\n- Een fout. (#15)\n`,
        )
        .replace('v0.2.0...HEAD\n', `v0.3.0...HEAD\n[0.3.0]: ${REPOSITORY}/compare/v0.2.0...v0.3.0\n`),
    )
    assert.equal(JSON.parse(await readFile(join(folder.dir, 'package.json'), 'utf8')).version, '0.3.0')
    assert.equal(JSON.parse(await readFile(join(folder.dir, 'package-lock.json'), 'utf8')).version, '0.3.0')
    assert.deepEqual([existsSync(join(folder.dir, 'changes/14-een-indeling.md')), existsSync(join(folder.dir, 'changes/README.txt'))], [false, true])
    assert.equal(git('log', '-1', '--format=%s'), 'Release 0.3.0')
    assert.equal(git('status', '--porcelain'), '')
  })

  const refusals = [
    ['a version that is none', {}, 'v0.3', 2, /^usage: npm run release/],
    ['no version', {}, undefined, 2, /^usage: npm run release/],
    ['nothing to release', {}, '0.3.0', 1, /nothing to release/],
    ['a change with a name that is not <number>-<title>.md', { 'changes/een-indeling.md': '### Toegevoegd\n\n- Een indeling.\n' }, '0.3.0', 1, /changes\/een-indeling\.md: the name is not <number>-<title>\.md/],
    ['a kind Keep a Changelog does not have', { 'changes/14-een-indeling.md': '### Nieuw\n\n- Een indeling. (#14)\n' }, '0.3.0', 1, /changes\/14-een-indeling\.md: "### Nieuw" is not one of/],
    ['a line before its kind', { 'changes/14-een-indeling.md': '- Een indeling. (#14)\n' }, '0.3.0', 1, /an entry comes before its "### <kind>" heading/],
  ]
  for (const [what, files, version, exit, message] of refusals) {
    it(`refuses ${what}, and leaves the repository as it was`, async () => {
      await repository(files)
      const { code, stderr } = await release(version)
      assert.equal(code, exit)
      assert.match(stderr, message)
      assert.equal(git('status', '--porcelain'), '')
      assert.equal(git('log', '-1', '--format=%s'), 'Begin')
    })
  }

  it('refuses a working tree with changes', async () => {
    await repository({ 'changes/14-een-indeling.md': '### Toegevoegd\n\n- Een indeling. (#14)\n' })
    await writeFile(join(folder.dir, 'los.txt'), 'Nog niet vastgelegd.')
    const { code, stderr } = await release('0.3.0')
    assert.equal(code, 1)
    assert.match(stderr, /the working tree is not clean/)
  })

  it('refuses a version that has its tag', async () => {
    await repository({ 'changes/14-een-indeling.md': '### Toegevoegd\n\n- Een indeling. (#14)\n' })
    git('tag', 'v0.3.0')
    const { code, stderr } = await release('0.3.0')
    assert.equal(code, 1)
    assert.match(stderr, /the tag v0\.3\.0 exists/)
  })
})

describe('the notes of a release', () => {
  let folder
  afterEach(() => folder?.remove())

  const notes = async (version, text = changelog()) => {
    folder = await project({ 'CHANGELOG.md': text })
    return node(folder.dir, join(repo, 'scripts/release-notes.mjs'), ...(version ? [version] : []))
  }

  it('are the section of the version', async () => {
    assert.deepEqual(await notes('0.2.0'), { code: 0, stdout: '### Toegevoegd\n\n- Een bundel. (#11)\n', stderr: '' })
  })

  it('are the same for the tag', async () => {
    assert.equal((await notes('v0.2.0')).stdout, '### Toegevoegd\n\n- Een bundel. (#11)\n')
  })

  it('end where the links begin, for the oldest version', async () => {
    assert.equal((await notes('0.1.0')).stdout, '### Toegevoegd\n\n- De eerste versie.\n')
  })

  it('fail for a version without a section', async () => {
    const { code, stderr } = await notes('0.3.0')
    assert.deepEqual([code, stderr], [1, 'CHANGELOG.md has no section "## [0.3.0]"\n'])
  })

  it('fail for an empty section', async () => {
    const { code, stderr } = await notes('0.3.0', changelog('\n## [0.3.0] - 2026-12-01\n'))
    assert.deepEqual([code, stderr], [1, 'CHANGELOG.md: the section "## [0.3.0]" is empty\n'])
  })

  it('fail without a version', async () => {
    assert.equal((await notes()).code, 2)
  })
})
