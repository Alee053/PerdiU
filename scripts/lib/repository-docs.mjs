import { readFile, realpath } from 'node:fs/promises'
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path'

function outside(root, path) {
  const part = relative(root, path)
  return part === '..' || part.startsWith('..' + sep) || isAbsolute(part)
}

export async function checkDocuments(root, documents) {
  const base = await realpath(root)
  const errors = []
  for (const document of documents) {
    const path = resolve(base, document)
    if (outside(base, await realpath(path))) {
      errors.push(`${document}: documento fuera del repositorio.`)
      continue
    }
    const source = await readFile(path, 'utf8')
    if (basename(path) === 'SKILL.md') {
      const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1]
      const field = (name) =>
        frontmatter
          ?.match(new RegExp(`^${name}:[ \\t]*(.+)$`, 'm'))?.[1]
          .trim()
          .replace(/^(['"])(.*)\1$/, '$2')
      const name = field('name')
      const description = field('description')
      if (
        !name ||
        name !== basename(dirname(path)) ||
        name.length > 64 ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)
      )
        errors.push(`${document}: nombre de skill inválido o distinto de su carpeta.`)
      if (!description || /^(?:[>|\[\{]|null$|true$|false$)/.test(description))
        errors.push(`${document}: falta una descripción de texto en una línea.`)
    }
    const prose = source.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '').replace(/`[^`\n]*`/g, '')
    const links = [...prose.matchAll(/!?\[[^\]\n]*\]\((<[^>]+>|[^)\s]+)(?:\s+"[^"]*")?\)/g)].map(
      (match) => match[1],
    )
    links.push(
      ...[...prose.matchAll(/^\s*\[[^\]\n]+\]:\s*(<[^>]+>|\S+)/gm)].map((match) => match[1]),
    )
    for (const target of links) {
      const link = target.replace(/^<|>$/g, '')
      if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(link)) continue
      try {
        const destination = resolve(dirname(path), decodeURIComponent(link.split(/[?#]/)[0]))
        if (outside(base, destination) || outside(base, await realpath(destination)))
          throw new Error('outside')
      } catch {
        errors.push(`${document}: enlace local inválido o ausente: ${link}`)
      }
    }
  }
  return errors
}
