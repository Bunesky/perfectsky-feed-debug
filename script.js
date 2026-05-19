// script.js – PerfectSky Feed Debug
console.log("PerfectSky Feed Debug loaded.");

const statusEl = document.getElementById("status");
const statsEl = document.getElementById("stats");
const rawEl = document.getElementById("raw");

async function main() {
  try {
    statusEl.textContent = "Loading feed...";

    // MISMO ENDPOINT QUE EL BOT
    const feedURL =
      'https://public.api.bsky.app/xrpc/app.bsky.feed.getFeed?feed=' +
      encodeURIComponent('at://did:plc:jlyxq2frdkpnkwhzldvmjlrv/app.bsky.feed.generator/aaadxgnfze66k');

    const res = await fetch(feedURL);
    if (!res.ok) throw new Error("HTTP Error " + res.status);

    const data = await res.json();
    if (!data.feed || data.feed.length === 0) {
      throw new Error("Feed returned empty");
    }

    // MISMO PROCESO QUE EL BOT
    const posts = data.feed.map(item => item.post);

    // 2) Analyze posts (MISMA FUNCIÓN DEL BOT)
    const stats = analyze(posts);

    // 3) Show stats on screen
    statsEl.textContent =
      "Posts analyzed: " + stats.total + "\n" +
      "Avg characters: " + stats.avgChars + "\n" +
      "Avg words: " + stats.avgWords + "\n" +
      "Avg hashtags: " + stats.avgHashtags + "\n" +
      "% with image: " + stats.imagePct + "%\n" +
      "% with video: " + stats.videoPct + "%\n" +
      "% without media: " + stats.noMediaPct + "%\n" +
      "% with links: " + stats.linksPct + "%\n" +
      "% replies: " + stats.repliesPct + "%\n" +
      "% originals: " + stats.originalsPct + "%\n" +
      "% quotes: " + stats.quotesPct + "%";

    // 4) Show raw post 0
    rawEl.textContent = JSON.stringify(posts[0], null, 2);

    statusEl.textContent = "Done";

  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error loading feed";
    statsEl.textContent = err.message;
  }
}

function analyze(posts) {
  let totalChars = 0;
  let totalWords = 0;
  let totalHashtags = 0;

  let withImage = 0;
  let withVideo = 0;
  let noMedia = 0;
  let withLinks = 0;

  let replies = 0;
  let originals = 0;
  let quotes = 0;

  for (const post of posts) {
    const text = post.record.text || '';

    totalChars += text.length;

    const words = text.trim().split(/\s+/).filter(Boolean);
    totalWords += words.length;

    const hashtags = text.match(/#[a-zA-Z][a-zA-Z0-9_]+/g) || [];
    totalHashtags += hashtags.length;

    const embedType = post.embed?.$type || '';

    if (embedType.includes('images')) withImage++;
    else if (embedType.includes('video')) withVideo++;
    else noMedia++;

    const hasLink =
      text.includes('http://') ||
      text.includes('https://') ||
      embedType.includes('external');

    if (hasLink) withLinks++;

    if (post.reply) replies++;
    else if (embedType.includes('record')) quotes++;
    else originals++;
  }

  const total = posts.length;

  return {
    total,
    avgChars: Math.round(totalChars / total),
    avgWords: Math.round(totalWords / total),
    avgHashtags: (totalHashtags / total).toFixed(2),
    imagePct: Math.round((withImage / total) * 100),
    videoPct: Math.round((withVideo / total) * 100),
    noMediaPct: Math.round((noMedia / total) * 100),
    linksPct: Math.round((withLinks / total) * 100),
    repliesPct: Math.round((replies / total) * 100),
    originalsPct: Math.round((originals / total) * 100),
    quotesPct: Math.round((quotes / total) * 100),
  };
}

main();
