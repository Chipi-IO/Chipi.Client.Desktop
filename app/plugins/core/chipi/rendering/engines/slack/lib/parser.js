import stringReplaceAsync from 'string-replace-async'
import slackDataLookupProvider from './slackDataLookupProvider'
import emoji from '../../emoji'
import Logger from '../../../../../../../lib/logger';
import rowStyles from '../../../../../../../../app/main/components/OutputPanel/ResultsList/Row/styles.css';

const logger = new Logger('slack.parser');

function parseEmoji(match) {
  /*const custom = account.emoji[p1]
  if (custom)
    return `<span style="background-image: url(${custom})" class="custom size-${size} emoji"></span>`
*/

  logger.verbose('parserEmoji', { match });
  let data = emoji.shortnameToEmoji(match)
  /*if (!data)
    return null
  if (p1.startsWith('skin-tone-'))
    return ''
  const x = data.x * size
  const y = data.y * size
  return `<span style="background-position: -${x}px -${y}px" class="apple size-${size} emoji"></span>`*/
  return data;
}

const rules = [
  {
    regex: /(:[\w\d\+\-\_]+::skin-tone-\d:)|(:[\w\d\+\-\_]+:)/gi,
    replacer(match) {
      const r = parseEmoji(match)
      return r ? r : match
    }
  },
  {
    regex: /(\n\n)/g,
    replacer() {
      return '<span class="para-br"> </span>'
    }
  },
  {
    regex: /(\r\n|\r|\n)/g,
    replacer() {
      return ' '
    }
  },
  {
    regex: /(^|[^\w]+)\*([^\*]+)\*([^\w]+|$)/g,
    replacer(match, p1, p2, p3) {
      return `${p1}<strong>${p2}</strong>${p3}`
    }
  },
  {
    regex: /(^|[^\w]+)_([^_]+)_([^\w]+|$)/g,
    replacer(match, p1, p2, p3) {
      return `${p1}<em>${p2}</em>${p3}`
    }
  },
  {
    regex: /(^|[^\w]+)~([^~]+)~([^\w]+|$)/g,
    replacer(match, p1, p2, p3) {
      return `${p1}<del>${p2}</del>${p3}`
    }
  },
  {
    regex: /`([^`]+)`/g,
    replacer(match, p1) {
      return `<code>${p1}</code>`
    }
  },
]

function runRules(text) {
  for (const rule of rules)
    text = text.replace(rule.regex, rule.replacer.bind(null))
  return text
}

function parseReference(content, display) {
  if (['!channel', '!here', '!everyone'].includes(content))
    return `<span class="broadcast">@${content.substr(1)}</span>`
  else
    return display
}

function parseChannel(id, display) {
  //const archiveLink = `${slackDataLookupProvider.url}/archives/${id}`
  //return `<a href="${archiveLink}" onclick="wey.openChannel('${id}'); return false">#${display}</a>`
  return `#${display}`;
}

async function parseAt(id) {
  const user = await slackDataLookupProvider.fetchUser(id)

  if (!user)
    return `@&lt;unknown user: ${id}&gt;`
  if (id === slackDataLookupProvider.currentUserId)
    return `<span class="broadcast at">@${user.displayName}</span>`
  else
    return `<span class="at">@${user.displayName}</span>`
}

function parseSlackLink(text, shouldParseAt) {
  let content, display
  const match = text.match(/(.+)\|(.+)/)
  if (match) {
    content = match[1]
    display = match[2]
  } else {
    content = display = text
  }
  if (content.startsWith('!')) {
    return [true, parseReference(content, display)]
  } else if (content.startsWith('#')) {
    return [false, parseChannel(content.substr(1), display)]
  } else if (shouldParseAt && content.startsWith('@')) {
    const hasMention = content.substr(1) === slackDataLookupProvider.currentUserId
    return [hasMention, parseAt(content.substr(1))]
  } else {
    return [false, `<a class="${rowStyles.link}" href="${content}">${display}</a>`]
  }
}

function parseMarkdown(text) {
  // Translate markdown in text but ignore the text inside code blocks.
  let preIndex = 0;
  let start = 0
  let newText = ''
  while ((preIndex = text.indexOf('```', start)) !== -1) {
    newText += runRules(text.substring(start, preIndex).trim())
    start = preIndex + 3
    preIndex = text.indexOf('```', start)
    if (preIndex === -1)
      break
    newText += '<pre>' + text.substring(start, preIndex).trim() + '</pre>'
    start = preIndex + 3
  }
  newText += runRules(text.substr(start).trimLeft())
  return newText
}

function slackMarkdownToHtmlSync(text) {
  text = text.replace(/<([^<>]+)>/g, (_, p1) => parseSlackLink(p1, false)[1])
  return parseMarkdown(text)
}

async function parseLinks(text) {
  let anyHasMention = false
  text = await stringReplaceAsync(text, /<([^<>]+)>/g, async (_, p1) => {
    const [hasMention, result] = parseSlackLink(p1, true)
    if (hasMention)
      anyHasMention = true
    if (result instanceof Promise)
      return await result
    else
      return result
  })
  return [anyHasMention, text]
  //return text;
}

async function slackMarkdownToHtml(text) {
  const [hasMention, result] = await parseLinks(text)
  return [hasMention, parseMarkdown(result)]
}

export default {
  slackMarkdownToHtml, slackMarkdownToHtmlSync
}
