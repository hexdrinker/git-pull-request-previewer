export const preprocessGithubVideos = (text: string): string => {
  // GitHub video attachment file pattern
  // https://github.com/user-attachments/assets/HASH
  const videoUrlPattern =
    /^\s*(https:\/\/github\.com\/user-attachments\/assets\/[a-zA-Z0-9-]+)\s*$/gm

  return text.replace(videoUrlPattern, (match, url) => {
    return `<video controls width="100%" style="max-width: 600px; border-radius: 6px;">
      <source src="${url}">
      비디오를 재생할 수 없습니다.
    </video>`
  })
}

export const processVideoLinks = (html: string): string => {
  const videoPattern = /<a href="([^"]+\.(mp4|mov|webm|ogg))"[^>]*>(.*?)<\/a>/g
  const videoReplacement =
    '<video controls style="max-width: 100%; border-radius: 6px;"><source src="$1" type="video/$2">$3</video>'

  return html.replace(videoPattern, videoReplacement)
}

export const enhanceImageStyles = (html: string): string => {
  return html.replace(/<img([^>]+)>/g, (match, attrs) => {
    if (attrs.includes('style=')) {
      return match.replace(/style="([^"]+)"/, 'style="$1; border-radius: 6px;"')
    } else {
      return `<img${attrs} style="max-width: 100%; border-radius: 6px;">`
    }
  })
}
